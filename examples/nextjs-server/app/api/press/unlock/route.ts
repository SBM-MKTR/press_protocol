import { type PaymentPayload, type PaymentDetails } from "@ton-x402/core";
import { ARTICLES, getPrice } from "../articles";
import { getPaymentConfig } from "../../../../lib/payment-config";

/**
 * POST /api/press/unlock
 *
 * Browser/TonConnect payment flow — called after the user's wallet has
 * already broadcast the Jetton transfer. The server confirms the payment
 * on-chain via the facilitator (which polls without re-broadcasting if the
 * tx is already submitted) and returns the full article content.
 *
 * Body: { articleId, fromAddress, queryId, boc }
 *   - fromAddress: the TON wallet that sent the payment (raw or user-friendly)
 *   - queryId:     correlation ID embedded in the tx comment ("x402:<queryId>")
 *   - boc:         signed external message BOC returned by TonConnect.sendTransaction()
 *
 * The facilitator will attempt to broadcast the BOC. If TonConnect already
 * broadcast it, the broadcast call is skipped and polling proceeds normally
 * (see packages/facilitator/src/settle.ts).
 */
export async function POST(request: Request) {
  let body: { articleId?: string; fromAddress?: string; queryId?: string; boc?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { articleId, fromAddress, queryId, boc } = body;

  if (!articleId || !fromAddress || !queryId || !boc) {
    return Response.json(
      { error: "Missing required fields: articleId, fromAddress, queryId, boc" },
      { status: 400 },
    );
  }

  const article = ARTICLES[articleId];
  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  const config = getPaymentConfig({
    amount: getPrice(articleId),
    asset: process.env.JETTON_MASTER_ADDRESS,
    decimals: 9,
  });

  const paymentPayload: PaymentPayload = {
    scheme: "ton-v1",
    network: config.network,
    boc,
    fromAddress,
    queryId,
  };

  const paymentDetails: PaymentDetails = {
    scheme: "ton-v1",
    network: config.network,
    amount: config.amount,
    asset: config.asset,
    payTo: config.payTo,
    facilitatorUrl: config.facilitatorUrl,
    decimals: 9,
  };

  // Call the facilitator settle endpoint.
  // The facilitator will try to broadcast the BOC; if TonConnect already broadcast it,
  // the sendFile call will be skipped gracefully and polling will find the tx on-chain.
  let settleResult: { success: boolean; txHash?: string; error?: string };
  try {
    const settleRes = await fetch(`${config.facilitatorUrl}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentPayload, paymentDetails }),
    });
    settleResult = await settleRes.json();
  } catch (err) {
    return Response.json(
      { error: `Facilitator unreachable: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  if (!settleResult.success) {
    return Response.json(
      { error: settleResult.error ?? "Payment not confirmed on-chain" },
      { status: 402 },
    );
  }

  // Payment confirmed on-chain — return article content
  article.readCount += 1;

  return Response.json({
    title: article.title,
    author: article.author,
    content: article.content,
    splits: article.splits,
    priceDisplay: article.priceDisplay,
    readCount: article.readCount,
    txHash: settleResult.txHash,
    message: "Payment confirmed on TON blockchain. Full article unlocked.",
  });
}
