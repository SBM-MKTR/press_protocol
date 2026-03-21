import { TonClient, Address } from "@ton/ton";
import { beginCell } from "@ton/core";

/**
 * GET /api/press/jetton-wallet?owner={walletAddress}
 *
 * Resolves the BSA USD jetton wallet address for a given TON wallet owner.
 * This is needed by the browser to build the TEP-74 Jetton transfer message
 * before calling TonConnect.sendTransaction().
 *
 * The jetton wallet is specific to each owner — it's the contract that holds
 * that owner's BSA USD balance.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");

  if (!owner) {
    return Response.json({ error: "Missing required parameter: owner" }, { status: 400 });
  }

  const jettonMaster = process.env.JETTON_MASTER_ADDRESS;
  if (!jettonMaster) {
    return Response.json({ error: "JETTON_MASTER_ADDRESS not configured" }, { status: 500 });
  }

  try {
    const client = new TonClient({
      endpoint: process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey: process.env.RPC_API_KEY,
    });

    const masterAddress = Address.parse(jettonMaster);
    const ownerAddress = Address.parse(owner);

    const result = await client.runMethod(masterAddress, "get_wallet_address", [
      { type: "slice", cell: beginCell().storeAddress(ownerAddress).endCell() },
    ]);

    const jettonWalletAddress = result.stack.readAddress();
    const isTestnet = (process.env.TON_NETWORK ?? "testnet") === "testnet";

    return Response.json({
      walletAddress: jettonWalletAddress.toString({ bounceable: true, testOnly: isTestnet }),
    });
  } catch (err) {
    return Response.json(
      { error: `Failed to resolve jetton wallet: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
