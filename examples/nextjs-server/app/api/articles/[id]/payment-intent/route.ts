import {
    createPaymentAttemptForArticle,
    getArticleAccessByWallet,
    getArticleForClient,
} from "../../../../../lib/repositories/articles";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const article = await getArticleForClient(id);

    if (!article) {
        return Response.json({ error: "Article not found" }, { status: 404 });
    }

    const payerWallet =
        typeof body?.payerWallet === "string" && body.payerWallet.trim().length > 0
            ? body.payerWallet.trim()
            : undefined;
    const paymentMethod =
        body?.paymentMethod === "tonconnect" ? "tonconnect" : "x402";

    const attempt = await createPaymentAttemptForArticle(id, {
        payerWallet,
        paymentMethod,
        metadata: {
            source: "article-payment-intent-route",
        },
    });
    if (!attempt) {
        return Response.json({ error: "Failed to create payment attempt" }, { status: 500 });
    }

    const access = payerWallet
        ? await getArticleAccessByWallet(id, payerWallet)
        : null;

    return Response.json({
        paymentAttempt: attempt,
        article: {
            id: article.id,
            title: article.title,
            priceAtomic: article.priceAtomic,
            priceDisplay: article.priceDisplay,
            priceTier: article.priceTier,
            contributors: article.contributors,
        },
        access,
        endpoints: {
            unlock: `/api/articles/${id}/unlock`,
            content: `/api/articles/${id}/content`,
            access: `/api/articles/${id}/access`,
            paymentAttempt: `/api/payment-attempts/${attempt.id}`,
            paymentSubmitted: `/api/payment-attempts/${attempt.id}/submitted`,
        },
    });
}
