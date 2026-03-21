import {
    getArticleAccessByWallet,
    getArticleForClient,
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
        return Response.json({
            articleId: id,
            wallet: null,
            unlocked: false,
            unlockGrant: null,
            confirmedPayment: null,
            paywall: {
                priceAtomic: article.priceAtomic,
                priceDisplay: article.priceDisplay,
                priceTier: article.priceTier,
                readCount: article.readCount,
            },
        });
    }

    const access = await getArticleAccessByWallet(id, wallet);
    return Response.json({
        ...(access ?? {
            articleId: id,
            wallet,
            unlocked: false,
            unlockGrant: null,
            confirmedPayment: null,
        }),
        paywall: {
            priceAtomic: article.priceAtomic,
            priceDisplay: article.priceDisplay,
            priceTier: article.priceTier,
            readCount: article.readCount,
        },
    });
}
