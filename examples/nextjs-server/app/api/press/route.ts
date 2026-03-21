import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";
import { ARTICLES, getPrice } from "./articles";

const handler = async (request: Request) => {
  const { articleId } = await request.json();

  const article = ARTICLES[articleId];
  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  // Increment read count for dynamic pricing
  article.readCount += 1;

  return Response.json({
    title: article.title,
    author: article.author,
    content: article.content,
    splits: article.splits,
    readCount: article.readCount,
    message: "Payment confirmed. Full article unlocked.",
    txNote: "Payment split automatically between all contributors on TON blockchain."
  });
};

export const POST = paymentGate(handler, {
  config: getPaymentConfig({
    amount: getPrice("demo"),
    asset: process.env.JETTON_MASTER_ADDRESS,
    description: "Press Protocol — Water Crisis in Senegal by Amara Diallo",
    decimals: 9,
  }),
});