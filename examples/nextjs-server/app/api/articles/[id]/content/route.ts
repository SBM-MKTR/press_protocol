import {
    getArticleAccessByWallet,
    getArticleForClient,
    getUnlockedArticleByWallet,
} from "../../../../../lib/repositories/articles";

const WALLET_HEADER = "x-press-wallet-address";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const article = await getArticleForClient(id);
    if (!article) {
        return Response.json({ error: "Article not found" }, { status: 404 });
    }

    const wallet =
        new URL(request.url).searchParams.get("wallet")?.trim() ||
        request.headers.get(WALLET_HEADER)?.trim() ||
        "";

    if (!wallet) {
        return Response.json(
            {
                error: "Wallet address required to resolve access",
                article: {
                    id: article.id,
                    title: article.title,
                    preview: article.preview,
                    priceAtomic: article.priceAtomic,
                    priceDisplay: article.priceDisplay,
                    priceTier: article.priceTier,
                    contributors: article.contributors,
                },
            },
            { status: 401 },
        );
    }

    const unlockedArticle = await getUnlockedArticleByWallet(id, wallet);
    if (!unlockedArticle) {
        const access = await getArticleAccessByWallet(id, wallet);
        return Response.json(
            {
                error: "Article is still locked for this wallet",
                article: {
                    id: article.id,
                    title: article.title,
                    preview: article.preview,
                    priceAtomic: article.priceAtomic,
                    priceDisplay: article.priceDisplay,
                    priceTier: article.priceTier,
                    contributors: article.contributors,
                },
                access: access ?? {
                    articleId: id,
                    wallet,
                    unlocked: false,
                    unlockGrant: null,
                    confirmedPayment: null,
                },
            },
            { status: 403 },
        );
    }

    const access = await getArticleAccessByWallet(id, wallet);
    return Response.json({
        article: {
            id: unlockedArticle.id,
            slug: unlockedArticle.slug,
            title: unlockedArticle.title,
            author: unlockedArticle.authorName,
            location: unlockedArticle.location,
            category: unlockedArticle.category,
            content: unlockedArticle.content,
            readCount: unlockedArticle.readCount,
            contributors: unlockedArticle.contributors,
        },
        access,
    });
}
