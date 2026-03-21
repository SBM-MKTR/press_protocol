import { createPaymentAttemptForArticle, getArticleForClient } from "../../../../../lib/repositories/articles";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const article = await getArticleForClient(id);

    if (!article) {
        return Response.json({ error: "Article not found" }, { status: 404 });
    }

    const attempt = await createPaymentAttemptForArticle(id);
    if (!attempt) {
        return Response.json({ error: "Failed to create payment attempt" }, { status: 500 });
    }

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
    });
}
