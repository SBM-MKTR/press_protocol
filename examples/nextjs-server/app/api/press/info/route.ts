import { generateQueryId } from "@ton-x402/core";
import { ARTICLES, getPrice } from "../articles";

/**
 * GET /api/press/info?articleId=demo
 *
 * Returns payment requirements for the browser/TonConnect flow.
 * Generates a fresh queryId per request — used as a correlation ID to match
 * the on-chain transaction after the wallet broadcasts it.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId") ?? "demo";

  const article = ARTICLES[articleId];
  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  const amount = getPrice(articleId);

  // Human-readable amount: amount / 10^9 (BSA USD has 9 decimals)
  const priceDisplay = `${(Number(amount) / 1e9).toFixed(2)} BSA USD`;

  const queryId = generateQueryId();

  return Response.json({
    articleId,
    queryId,
    amount,          // atomic units (string), e.g. "100000000"
    priceDisplay,    // e.g. "0.10 BSA USD"
    payTo: process.env.PAYMENT_ADDRESS,
    jettonMaster: process.env.JETTON_MASTER_ADDRESS,
    network: process.env.TON_NETWORK ?? "testnet",
    comment: `x402:${queryId}`,
  });
}
