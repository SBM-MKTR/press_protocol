import {
    type PaymentPayload,
    type PaymentDetails,
    type SettleResponse,
} from "@ton-x402/core";
import { TonClient, Address, Cell, Transaction } from "@ton/ton";
import { beginCell } from "@ton/core";

export interface SettleOptions {
    client: TonClient;
    timeoutMs?: number;
    pollIntervalMs?: number;
}

// In-memory dedup cache
const settlementCache = new Map<string, { timestamp: number }>();
const CACHE_TTL_MS = 120_000;

function cleanCache() {
    const now = Date.now();
    for (const [key, val] of settlementCache) {
        if (now - val.timestamp > CACHE_TTL_MS) {
            settlementCache.delete(key);
        }
    }
}

export async function settleBoc(
    paymentPayload: PaymentPayload,
    paymentDetails: PaymentDetails,
    options: SettleOptions,
): Promise<SettleResponse> {
    const { client, timeoutMs = 60_000, pollIntervalMs = 3_000 } = options;

    try {
        // Dedup check
        cleanCache();
        const cacheKey = paymentPayload.boc;
        if (settlementCache.has(cacheKey)) {
            return {
                success: false,
                error: "Duplicate settlement: this BOC has already been submitted",
            };
        }
        settlementCache.set(cacheKey, { timestamp: Date.now() });

        // Broadcast the BOC
        // Note: TonConnect wallet flows may broadcast before the server does.
        // We swallow broadcast errors and proceed to poll — the tx may already be on-chain.
        const bocBuffer = Buffer.from(paymentPayload.boc, "base64");
        console.log(`[settle] Broadcasting BOC for queryId=${paymentPayload.queryId} from=${paymentPayload.fromAddress}`);
        console.log(`[settle] Asset=${paymentDetails.asset} amount=${paymentDetails.amount} payTo=${paymentDetails.payTo}`);
        try {
            await client.sendFile(bocBuffer);
            console.log(`[settle] BOC broadcast OK`);
        } catch (broadcastErr) {
            // Pre-broadcast by client (e.g. TonConnect) is expected — proceed to poll
            console.log(`[settle] Broadcast skipped (already submitted?): ${(broadcastErr as Error).message}`);
        }

        // Wait for on-chain confirmation
        const destAddress = Address.parse(paymentDetails.payTo);
        const fromAddress = Address.parse(paymentPayload.fromAddress);
        const startTime = Date.now();
        const queryId = paymentPayload.queryId;
        const expectedAmount = BigInt(paymentDetails.amount);
        const assetIsTon = paymentDetails.asset === "TON";
        const recipientJettonWallet = assetIsTon
            ? null
            : await resolveJettonWalletAddress(client, paymentDetails.asset, destAddress).catch(() => null);
        const senderJettonWallet = assetIsTon
            ? null
            : await resolveJettonWalletAddress(client, paymentDetails.asset, fromAddress).catch(() => null);

        let pollCount = 0;
        while (Date.now() - startTime < timeoutMs) {
            await sleep(pollIntervalMs);
            pollCount++;

            try {
                const pollTargets = [
                    { label: "owner", address: destAddress },
                    ...(recipientJettonWallet
                        ? [{ label: "recipient-jetton", address: recipientJettonWallet }]
                        : []),
                ];

                for (const target of pollTargets) {
                    const transactions = await client.getTransactions(target.address, {
                        limit: 20,
                    });

                    console.log(
                        `[settle] Poll #${pollCount} — found ${transactions.length} txs on ${target.label}:${target.address.toString()}`,
                    );

                    for (const tx of transactions) {
                        const inMsg = tx.inMessage;
                        if (inMsg?.info.type === "internal") {
                            const slice = inMsg.body.beginParse();
                            const op = slice.remainingBits >= 32 ? slice.preloadUint(32) : -1;
                            console.log(
                                `[settle]   tx on ${target.label} op=0x${op.toString(16)} from=${inMsg.info.src?.toString()}`,
                            );
                        }

                        const match = matchTransaction(tx, {
                            expectedOwnerWallet: destAddress,
                            expectedRecipientJettonWallet: recipientJettonWallet,
                            expectedSenderWallet: fromAddress,
                            expectedSenderJettonWallet: senderJettonWallet,
                            expectedAmount,
                            queryId,
                            asset: paymentDetails.asset,
                        });
                        if (!match) {
                            continue;
                        }

                        const txHash = tx.hash().toString("hex");
                        console.log(`[settle] MATCH found! txHash=${txHash}`);
                        return { success: true, txHash };
                    }
                }
            } catch (e) {
                console.log(`[settle] Poll #${pollCount} error: ${(e as Error).message}`);
            }
        }
        console.log(`[settle] Timeout after ${pollCount} polls`);

        return {
            success: false,
            error: "Settlement timeout: transaction not confirmed within timeout period. It may still confirm.",
        };
    } catch (err) {
        settlementCache.delete(paymentPayload.boc);
        return {
            success: false,
            error: `Settlement error: ${(err as Error).message}`,
        };
    }
}

function matchTransaction(
    tx: Transaction,
    options: {
        expectedOwnerWallet: Address;
        expectedRecipientJettonWallet: Address | null;
        expectedSenderWallet: Address;
        expectedSenderJettonWallet: Address | null;
        expectedAmount: bigint;
        queryId: string;
        asset: string;
    },
): boolean {
    const inMsg = tx.inMessage;
    if (!inMsg) return false;
    if (inMsg.info.type !== "internal") return false;

    const info = inMsg.info;
    const slice = inMsg.body.beginParse();

    if (slice.remainingBits < 32) return false;
    const op = slice.loadUint(32);

    if (options.asset === "TON" && op === 0) {
        // Standard TON transfer with comment
        const text = slice.loadStringTail();
        if (text === `x402:${options.queryId}`) {
            return (
                info.src.equals(options.expectedSenderWallet) &&
                info.dest.equals(options.expectedOwnerWallet) &&
                info.value.coins >= options.expectedAmount
            );
        }
    } else if (options.asset !== "TON" && op === 0x7362d09c) {
        // Jetton transfer_notification
        // transfer_notification#7362d09c query_id:uint64 amount:(VarUint 16) sender:MsgAddress forward_payload:(Either Cell ^Cell)
        if (!options.expectedRecipientJettonWallet) return false;
        if (!info.dest.equals(options.expectedOwnerWallet)) return false;
        if (!info.src.equals(options.expectedRecipientJettonWallet)) return false;
        if (slice.remainingBits < 64) return false;
        const notificationQueryId = slice.loadUintBig(64).toString();
        if (notificationQueryId !== options.queryId) return false;

        const jettonAmount = slice.loadCoins();
        if (jettonAmount < options.expectedAmount) return false;

        const sender = slice.loadAddress();
        const senderMatchesOwner = sender?.equals(options.expectedSenderWallet) ?? false;
        const senderMatchesJettonWallet =
            options.expectedSenderJettonWallet
                ? sender?.equals(options.expectedSenderJettonWallet) ?? false
                : false;

        if (!senderMatchesOwner && !senderMatchesJettonWallet) {
            return false;
        }

        // Check forward_payload
        if (slice.remainingBits < 1) return false;
        const payloadSlice = slice.loadBit() ? slice.loadRef().beginParse() : slice;
        if (payloadSlice.remainingBits >= 32) {
            const innerOp = payloadSlice.loadUint(32);
            if (innerOp === 0) {
                const text = payloadSlice.loadStringTail();
                if (text === `x402:${options.queryId}`) {
                    return true;
                }
            }
        }
    } else if (options.asset !== "TON" && op === 0x178d4519) {
        // internal_transfer on the recipient jetton wallet
        if (!options.expectedRecipientJettonWallet) return false;
        if (!info.dest.equals(options.expectedRecipientJettonWallet)) return false;

        if (slice.remainingBits < 64) return false;
        const internalQueryId = slice.loadUintBig(64).toString();
        if (internalQueryId !== options.queryId) return false;

        const jettonAmount = slice.loadCoins();
        if (jettonAmount < options.expectedAmount) return false;

        const from = slice.loadAddress();
        const fromMatchesOwner = from?.equals(options.expectedSenderWallet) ?? false;
        const fromMatchesJettonWallet =
            options.expectedSenderJettonWallet
                ? from?.equals(options.expectedSenderJettonWallet) ?? false
                : false;

        if (!fromMatchesOwner && !fromMatchesJettonWallet) {
            return false;
        }

        slice.loadAddress(); // response_address
        const forwardTonAmount = slice.loadCoins();
        if (forwardTonAmount <= 0n) return false;

        if (slice.remainingBits < 1) return false;
        const payloadSlice = slice.loadBit() ? slice.loadRef().beginParse() : slice;
        if (payloadSlice.remainingBits >= 32) {
            const innerOp = payloadSlice.loadUint(32);
            if (innerOp === 0) {
                const text = payloadSlice.loadStringTail();
                if (text === `x402:${options.queryId}`) {
                    return true;
                }
            }
        }
    }

    return false;
}

async function resolveJettonWalletAddress(
    client: TonClient,
    jettonMaster: string,
    owner: Address,
) {
    const masterAddress = Address.parse(jettonMaster);
    const result = await client.runMethod(masterAddress, "get_wallet_address", [
        { type: "slice", cell: beginCell().storeAddress(owner).endCell() },
    ]);

    return result.stack.readAddress();
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
