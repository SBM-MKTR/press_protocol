import { HEADER_PAYMENT_SIGNATURE } from "@ton-x402/core";
import { paymentGate } from "@ton-x402/middleware";
import {
    INTERNAL_PAYMENT_AMOUNT_HEADER,
    INTERNAL_PAYMENT_ASSET_HEADER,
    INTERNAL_PAYMENT_FROM_HEADER,
    INTERNAL_PAYMENT_NETWORK_HEADER,
    INTERNAL_PAYMENT_QUERY_ID_HEADER,
    INTERNAL_PAYMENT_TX_HASH_HEADER,
} from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../../../lib/payment-config";
import {
    createPaymentAttemptForArticle,
    getPaymentAttemptById,
    getPublishedArticleById,
    markPaymentAttemptAsFailed,
    markPaymentAttemptAsRequired,
    markPaymentAttemptAsSubmitted,
    recordConfirmedArticleUnlock,
} from "../../../../../lib/repositories/articles";
import { getPriceTier } from "../../../../../lib/pricing";

const PAYMENT_ATTEMPT_HEADER = "x-press-payment-attempt-id";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const article = await getPublishedArticleById(id);

    if (!article) {
        return Response.json({ error: "Article not found" }, { status: 404 });
    }

    const price = getPriceTier(article.readCount);
    const hasPaymentSignature = Boolean(request.headers.get(HEADER_PAYMENT_SIGNATURE));
    let paymentAttemptId = request.headers.get(PAYMENT_ATTEMPT_HEADER);
    const existingAttempt = paymentAttemptId
        ? await getPaymentAttemptById(paymentAttemptId)
        : null;

    if (!paymentAttemptId && !hasPaymentSignature) {
        const attempt = await createPaymentAttemptForArticle(id);
        paymentAttemptId = attempt?.id ?? null;
    }

    const handler = async (paidRequest: Request) => {
        const payerWallet = paidRequest.headers.get(INTERNAL_PAYMENT_FROM_HEADER);
        const txHash = paidRequest.headers.get(INTERNAL_PAYMENT_TX_HASH_HEADER);
        const amountAtomic = paidRequest.headers.get(INTERNAL_PAYMENT_AMOUNT_HEADER);
        const assetAddress = paidRequest.headers.get(INTERNAL_PAYMENT_ASSET_HEADER);
        const network = paidRequest.headers.get(INTERNAL_PAYMENT_NETWORK_HEADER);
        const queryId = paidRequest.headers.get(INTERNAL_PAYMENT_QUERY_ID_HEADER);

        if (!payerWallet || !txHash || !amountAtomic || !assetAddress || !network) {
            return Response.json(
                { error: "Missing verified payment metadata from settlement flow" },
                { status: 500 },
            );
        }

        const updatedArticle = await recordConfirmedArticleUnlock({
            articleId: id,
            paymentAttemptId,
            payerWallet,
            txHash,
            queryId,
            network,
            assetAddress,
            amountAtomic,
            paymentMethod: existingAttempt?.paymentMethod ?? "x402",
        });

        if (!updatedArticle) {
            return Response.json({ error: "Article unlock failed" }, { status: 500 });
        }

        const updatedPrice = getPriceTier(updatedArticle.readCount);

        return Response.json({
            article: {
                id: updatedArticle.id,
                title: updatedArticle.title,
                author: updatedArticle.authorName,
                content: updatedArticle.content,
                category: updatedArticle.category,
                location: updatedArticle.location,
                readCount: updatedArticle.readCount,
                nextPriceDisplay: updatedPrice.display,
                contributors: updatedArticle.contributors,
            },
            payment: {
                message: "Payment confirmed. Full article unlocked.",
                pricingTier: price.label,
                paymentAttemptId,
                txHash,
            },
        });
    };

    const gatedHandler = paymentGate(handler, {
        config: getPaymentConfig({
            amount: price.amountAtomic,
            asset: process.env.JETTON_MASTER_ADDRESS,
            description: `Press Protocol — ${article.title}`,
            decimals: process.env.JETTON_MASTER_ADDRESS ? 9 : undefined,
        }),
    });

    if (paymentAttemptId && hasPaymentSignature) {
        await markPaymentAttemptAsSubmitted(paymentAttemptId, {
            paymentMethod: existingAttempt?.paymentMethod ?? "x402",
        });
    }

    const response = await gatedHandler(request);

    if (paymentAttemptId && !hasPaymentSignature && response.status === 402) {
        await markPaymentAttemptAsRequired(paymentAttemptId);
    }

    if (paymentAttemptId && hasPaymentSignature && response.status >= 400) {
        await markPaymentAttemptAsFailed(
            paymentAttemptId,
            `Unlock request failed with HTTP ${response.status}`,
        );
    }

    const headers = new Headers(response.headers);
    if (paymentAttemptId) {
        headers.set(PAYMENT_ATTEMPT_HEADER, paymentAttemptId);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}
