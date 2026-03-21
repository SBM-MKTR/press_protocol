"use client";

import {
    decodePaymentRequired,
    encodePaymentPayload,
    generateQueryId,
    HEADER_PAYMENT_REQUIRED,
    HEADER_PAYMENT_SIGNATURE,
} from "@ton-x402/core";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { beginCell, Address } from "@ton/core";

type Contributor = {
    name: string;
    role: string;
    wallet: string;
    percent: number;
};

type Article = {
    id: string;
    slug: string;
    title: string;
    author: string;
    location: string;
    category: string;
    preview: string;
    readCount: number;
    priceAtomic: string;
    priceDisplay: string;
    priceTier: string;
    contributors: Contributor[];
};

type UnlockPayload = {
    article: {
        id: string;
        title: string;
        author: string;
        content: string;
        category: string;
        location: string;
        readCount: number;
        nextPriceDisplay: string;
        contributors: Contributor[];
    };
    payment: {
        message: string;
        pricingTier: string;
    };
};

type PaymentAttempt = {
    id: string;
    articleId: string;
    expectedAmountAtomic: string;
    assetAddress: string;
    status: string;
    network: string;
    createdAt: string;
};

type TelegramContext = {
    isTelegram: boolean;
    firstName?: string;
    colorScheme?: string;
};

function PressPageContent() {
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id") ?? "demo";

    const [article, setArticle] = useState<Article | null>(null);
    const [unlockPayload, setUnlockPayload] = useState<UnlockPayload | null>(null);
    const [paymentRequired, setPaymentRequired] = useState<any>(null);
    const [paymentAttempt, setPaymentAttempt] = useState<PaymentAttempt | null>(null);
    const [status, setStatus] = useState<
        "loading" | "ready" | "awaiting_payment" | "processing" | "unlocked" | "error"
    >("loading");
    const [error, setError] = useState<string>("");
    const [telegram, setTelegram] = useState<TelegramContext>({ isTelegram: false });

    const [tonConnectUI] = useTonConnectUI();
    const rawAddress = useTonAddress(false);
    const isConnected = !!rawAddress;

    useEffect(() => {
        const tg = (window as any)?.Telegram?.WebApp;
        if (!tg) return;

        tg.ready?.();
        tg.expand?.();

        setTelegram({
            isTelegram: true,
            firstName: tg.initDataUnsafe?.user?.first_name,
            colorScheme: tg.colorScheme,
        });
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadArticle() {
            setStatus("loading");
            setError("");
            setUnlockPayload(null);
            setPaymentRequired(null);
            setPaymentAttempt(null);

            try {
                const response = await fetch(`/api/articles/${articleId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error || "Failed to load article");
                }

                if (!cancelled) {
                    setArticle(data.article);
                    setStatus("ready");
                }
            } catch (err) {
                if (!cancelled) {
                    setError((err as Error).message);
                    setStatus("error");
                }
            }
        }

        loadArticle();

        return () => {
            cancelled = true;
        };
    }, [articleId]);

    const contributorTotal = useMemo(
        () =>
            (unlockPayload?.article.contributors ?? article?.contributors ?? []).reduce(
                (sum, contributor) => sum + contributor.percent,
                0,
            ),
        [article, unlockPayload],
    );

    // Step 1: create payment attempt + get 402 payment requirements
    async function handlePay() {
        if (!article) return;

        setStatus("processing");
        setError("");

        try {
            let attemptId = paymentAttempt?.id ?? null;

            if (!attemptId) {
                const intentResponse = await fetch(`/api/articles/${article.id}/payment-intent`, {
                    method: "POST",
                });
                const intentData = await intentResponse.json();

                if (!intentResponse.ok) {
                    throw new Error(intentData?.error || "Failed to create payment attempt");
                }

                attemptId = intentData.paymentAttempt?.id ?? null;
                setPaymentAttempt(intentData.paymentAttempt ?? null);
            }

            const response = await fetch(`/api/articles/${article.id}/unlock`, {
                method: "POST",
                headers: attemptId
                    ? { "x-press-payment-attempt-id": attemptId }
                    : undefined,
            });

            if (response.status === 402) {
                const encoded = response.headers.get(HEADER_PAYMENT_REQUIRED);
                const details = encoded ? decodePaymentRequired(encoded) : null;
                const responseAttemptId = response.headers.get("x-press-payment-attempt-id");
                if (responseAttemptId && !paymentAttempt) {
                    setPaymentAttempt((current) =>
                        current ?? {
                            id: responseAttemptId,
                            articleId: article.id,
                            expectedAmountAtomic: article.priceAtomic,
                            assetAddress: details?.accepts?.[0]?.asset ?? "TON",
                            status: "payment_required",
                            network: details?.accepts?.[0]?.network ?? "testnet",
                            createdAt: new Date().toISOString(),
                        },
                    );
                }
                setPaymentRequired(details);
                setStatus("awaiting_payment");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to unlock article");
            }

            setUnlockPayload(data);
            setStatus("unlocked");
        } catch (err) {
            setError((err as Error).message);
            setStatus("error");
        }
    }

    // Step 2: sign + broadcast via TonConnect, retry unlock with PAYMENT-SIGNATURE
    async function handleWalletPay() {
        if (!rawAddress) {
            tonConnectUI.openModal();
            return;
        }
        if (!paymentRequired || !article) return;

        const tonOption = paymentRequired.accepts?.[0];
        if (!tonOption) {
            setError("No TON payment option in payment requirements");
            setStatus("error");
            return;
        }

        setStatus("processing");
        setError("");

        try {
            // Resolve sender's BSA USD jetton wallet address
            const jwRes = await fetch(
                `/api/press/jetton-wallet?owner=${encodeURIComponent(rawAddress)}`,
            );
            if (!jwRes.ok) throw new Error("Failed to resolve BSA USD wallet address");
            const { walletAddress: senderJettonWallet } = await jwRes.json();

            const queryId = generateQueryId();

            // Build TEP-74 Jetton transfer body
            const jettonTransferBody = beginCell()
                .storeUint(0xf8a7ea5, 32)                       // op::transfer
                .storeUint(BigInt(queryId), 64)                  // query_id
                .storeCoins(BigInt(tonOption.amount))             // jetton amount
                .storeAddress(Address.parse(tonOption.payTo))     // destination
                .storeAddress(Address.parse(rawAddress))          // response_destination (excess back)
                .storeMaybeRef(null)
                .storeCoins(1_000_000n)                          // forward_ton_amount (0.001 TON)
                .storeBit(0)
                .storeUint(0, 32)                                // comment prefix
                .storeStringTail(`x402:${queryId}`)              // correlation comment
                .endCell();

            // TonConnect: wallet signs + broadcasts, returns BOC
            const result = await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: senderJettonWallet,
                        amount: "70000000", // 0.07 TON gas
                        payload: jettonTransferBody.toBoc().toString("base64"),
                    },
                ],
            });

            // Encode PAYMENT-SIGNATURE header (x402 format)
            const encodedPayload = encodePaymentPayload({
                scheme: "ton-v1",
                network: tonOption.network,
                boc: result.boc,
                fromAddress: rawAddress,
                queryId,
            });

            const headers: Record<string, string> = {
                [HEADER_PAYMENT_SIGNATURE]: encodedPayload,
            };
            if (paymentAttempt?.id) {
                headers["x-press-payment-attempt-id"] = paymentAttempt.id;
            }

            // Retry unlock — facilitator broadcasts (or detects pre-broadcast), polls, confirms
            const unlockRes = await fetch(`/api/articles/${article.id}/unlock`, {
                method: "POST",
                headers,
            });

            const data = await unlockRes.json();
            if (!unlockRes.ok) {
                throw new Error(data?.error || "Payment confirmation failed");
            }

            setUnlockPayload(data);
            setStatus("unlocked");
        } catch (err) {
            const msg = (err as Error).message;
            if (
                msg.toLowerCase().includes("user rejected") ||
                msg.toLowerCase().includes("user declined")
            ) {
                setStatus("awaiting_payment");
                return;
            }
            setError(msg);
            setStatus("error");
        }
    }

    const visibleContributors = unlockPayload?.article.contributors ?? article?.contributors ?? [];
    const activePrice = article?.priceDisplay ?? "Loading...";

    return (
        <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                    <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Press Protocol</span>
                    </a>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                        {isConnected ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 20, padding: "4px 12px" }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#14b8a6" }} />
                                <span style={{ fontSize: 12, color: "#14b8a6" }}>
                                    {rawAddress.slice(0, 4)}…{rawAddress.slice(-4)}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={() => tonConnectUI.openModal()}
                                style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer" }}
                            >
                                Connect Wallet
                            </button>
                        )}
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                            {telegram.isTelegram
                                ? `Telegram${telegram.firstName ? ` · ${telegram.firstName}` : ""}`
                                : "Web preview"}
                        </span>
                    </div>
                </div>

                {telegram.isTelegram && (
                    <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 12, padding: "10px 14px", marginBottom: "1rem" }}>
                        <div style={{ fontSize: 13, color: "#14b8a6", fontWeight: 600, marginBottom: 4 }}>Telegram Mini App mode</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            In-chat reading · wallet handoff · theme: {telegram.colorScheme ?? "default"}
                        </div>
                    </div>
                )}

                {status === "loading" && (
                    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", color: "#94a3b8" }}>
                        Loading article...
                    </div>
                )}

                {status === "error" && (
                    <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Something went wrong</div>
                        <div style={{ fontSize: 13, color: "#fecaca" }}>{error}</div>
                    </div>
                )}

                {article && (
                    <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                            <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.category}</span>
                            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.location}</span>
                            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.readCount.toLocaleString()} readers</span>
                            <span style={{ background: "#1d4ed822", color: "#93c5fd", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.priceTier} tier</span>
                        </div>

                        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>{article.title}</h1>
                        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: "1.25rem" }}>
                            By {article.author} · Pay once, reward every contributor behind the story.
                        </p>

                        {/* Article body */}
                        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: "1.25rem", marginBottom: "1rem" }}>
                            <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.8, marginBottom: "1rem" }}>{article.preview}</div>
                            {status === "unlocked" && unlockPayload ? (
                                <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.8 }}>
                                    {unlockPayload.article.content.split("\n\n").map((paragraph, index) => (
                                        <p key={index} style={{ marginBottom: "1rem" }}>{paragraph}</p>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ position: "relative" }}>
                                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "#cbd5e1", filter: "blur(4px)", userSelect: "none", margin: 0 }}>
                                        Unlocking reveals the full investigation, the field reporting, the accountability details, and the evidence gathered on the ground. Payment is what turns this article from a platform asset into direct income for the people who produced it.
                                    </p>
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #0f172a)" }} />
                                </div>
                            )}
                        </div>

                        {/* Pricing + contributor split */}
                        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: "1.25rem", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current unlock price</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: "#14b8a6" }}>{activePrice}</div>
                                </div>
                                <div style={{ fontSize: 12, color: "#94a3b8", maxWidth: 240, textAlign: "right" }}>
                                    Prices rise with readership. Early supporters fund the reporting before it becomes established.
                                </div>
                            </div>

                            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                                Contributor split · {contributorTotal}%
                            </div>
                            {visibleContributors.map((contributor) => (
                                <div key={`${contributor.role}-${contributor.name}`} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 96, fontSize: 13, color: "#e2e8f0" }}>{contributor.role}</div>
                                    <div style={{ flex: 1, background: "#1e293b", borderRadius: 999, overflow: "hidden", height: 8 }}>
                                        <div style={{ width: `${contributor.percent}%`, background: "#14b8a6", height: "100%" }} />
                                    </div>
                                    <div style={{ width: 42, textAlign: "right", fontSize: 13, color: "#14b8a6", fontWeight: 700 }}>{contributor.percent}%</div>
                                </div>
                            ))}
                            <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
                                Splits shown are distribution targets. Atomic per-contributor on-chain routing is in development.
                            </p>
                        </div>

                        {/* awaiting_payment: TonConnect wallet signing */}
                        {status === "awaiting_payment" && paymentRequired && (
                            <div style={{ background: "#082f49", border: "1px solid #0ea5e9", borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Payment request ready</div>
                                <div style={{ fontSize: 12, color: "#bfdbfe", fontFamily: "monospace", marginBottom: 12 }}>
                                    {paymentRequired.accepts?.[0]?.amount} atomic BSA USD → {paymentRequired.accepts?.[0]?.payTo?.slice(0, 10)}…
                                    {paymentAttempt && (
                                        <span style={{ display: "block", marginTop: 4, color: "#93c5fd" }}>
                                            attempt: {paymentAttempt.id}
                                        </span>
                                    )}
                                </div>
                                {!isConnected ? (
                                    <button
                                        onClick={() => tonConnectUI.openModal()}
                                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#1d4ed8", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                                    >
                                        Connect TON Wallet to Pay
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleWalletPay}
                                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#14b8a6", color: "#0a0f1e", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                                    >
                                        Pay {activePrice} with TON Wallet
                                    </button>
                                )}
                            </div>
                        )}

                        {/* unlocked confirmation */}
                        {status === "unlocked" && unlockPayload && (
                            <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
                                <div style={{ fontSize: 14, color: "#14b8a6", fontWeight: 700, marginBottom: 6 }}>Article unlocked</div>
                                <div style={{ fontSize: 13, color: "#d1fae5", marginBottom: 6 }}>{unlockPayload.payment.message}</div>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                    Reader count is now {unlockPayload.article.readCount.toLocaleString()}. Next tier price: {unlockPayload.article.nextPriceDisplay}.
                                </div>
                            </div>
                        )}

                        {/* Primary CTA */}
                        {status !== "unlocked" && status !== "awaiting_payment" && (
                            <button
                                onClick={handlePay}
                                disabled={status === "processing" || status === "loading"}
                                style={{
                                    width: "100%",
                                    padding: "15px 16px",
                                    borderRadius: 14,
                                    border: "none",
                                    background: status === "processing" ? "#1e293b" : "#14b8a6",
                                    color: status === "processing" ? "#94a3b8" : "#0a0f1e",
                                    fontSize: 15,
                                    fontWeight: 800,
                                    cursor: status === "processing" ? "default" : "pointer",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                {status === "processing" ? "Confirming on TON blockchain…" : `Pay ${activePrice} to unlock`}
                            </button>
                        )}

                        <div style={{ textAlign: "center", fontSize: 12, color: "#64748b" }}>
                            Telegram-native reading · TON settlement · transparent contributor economics
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PressPage() {
    return (
        <Suspense
            fallback={
                <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
                    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>
                        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", color: "#94a3b8" }}>
                            Loading article shell...
                        </div>
                    </div>
                </div>
            }
        >
            <PressPageContent />
        </Suspense>
    );
}
