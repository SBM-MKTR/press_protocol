import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import {
    articleContributors,
    articleMetrics,
    articles,
    confirmedPayments,
    contributors,
    paymentAttempts,
    unlockGrants,
} from "../db/schema";
import { createId } from "../db/ids";
import { getPriceTier } from "../pricing";

type HydratedContributor = {
    id: string;
    name: string;
    wallet: string;
    role: "Journalist" | "Editor" | "Translator" | "Photographer" | "Protocol";
    percent: number;
};

type HydratedArticle = {
    id: string;
    slug: string;
    title: string;
    authorName: string;
    location: string;
    category: string;
    preview: string;
    content: string;
    readCount: number;
    contributors: HydratedContributor[];
};

type PaymentAttemptSummary = {
    id: string;
    articleId: string;
    expectedAmountAtomic: string;
    assetAddress: string;
    status: string;
    network: string;
    createdAt: Date;
};

export async function listPublishedArticles() {
    const db = getDb();
    const articleRows = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: articles.title,
            authorName: articles.authorName,
            location: articles.location,
            category: articles.category,
            preview: articles.preview,
            readCount: articleMetrics.readCount,
        })
        .from(articles)
        .innerJoin(articleMetrics, eq(articleMetrics.articleId, articles.id))
        .where(eq(articles.isPublished, true));

    const contributorsByArticle = await getContributorsForArticles(articleRows.map((row) => row.id));

    return articleRows.map((article) => {
        const price = getPriceTier(article.readCount);
        return {
            id: article.id,
            slug: article.slug,
            title: article.title,
            author: article.authorName,
            location: article.location,
            category: article.category,
            preview: article.preview,
            readCount: article.readCount,
            currentPrice: price.amountAtomic,
            priceDisplay: price.display,
            priceTier: price.label,
            contributors: contributorsByArticle.get(article.id) ?? [],
        };
    });
}

export async function getPublishedArticleById(id: string): Promise<HydratedArticle | null> {
    const db = getDb();
    const rows = await db
        .select({
            id: articles.id,
            slug: articles.slug,
            title: articles.title,
            authorName: articles.authorName,
            location: articles.location,
            category: articles.category,
            preview: articles.preview,
            content: articles.content,
            readCount: articleMetrics.readCount,
        })
        .from(articles)
        .innerJoin(articleMetrics, eq(articleMetrics.articleId, articles.id))
        .where(and(eq(articles.id, id), eq(articles.isPublished, true)))
        .limit(1);

    const article = rows[0];
    if (!article) return null;

    const contributorsByArticle = await getContributorsForArticles([article.id]);

    return {
        ...article,
        contributors: contributorsByArticle.get(article.id) ?? [],
    };
}

export async function getArticleForClient(id: string) {
    const article = await getPublishedArticleById(id);
    if (!article) return null;

    const price = getPriceTier(article.readCount);

    return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        author: article.authorName,
        location: article.location,
        category: article.category,
        preview: article.preview,
        readCount: article.readCount,
        priceAtomic: price.amountAtomic,
        priceDisplay: price.display,
        priceTier: price.label,
        contributors: article.contributors,
    };
}

export async function createPaymentAttemptForArticle(id: string): Promise<PaymentAttemptSummary | null> {
    const db = getDb();
    const article = await getPublishedArticleById(id);
    if (!article) return null;

    const price = getPriceTier(article.readCount);
    const assetAddress =
        process.env.JETTON_MASTER_ADDRESS ??
        "kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW";
    const network = process.env.TON_NETWORK === "mainnet" ? "mainnet" : "testnet";

    const attemptId = createId("pat");
    const [attempt] = await db
        .insert(paymentAttempts)
        .values({
            id: attemptId,
            articleId: id,
            expectedAmountAtomic: BigInt(price.amountAtomic),
            assetAddress,
            network,
            status: "created",
            paymentMethod: "x402",
            facilitatorUrl: process.env.FACILITATOR_URL,
            metadata: {
                articleSlug: article.slug,
                pricingTier: price.label,
            },
        } as any)
        .returning({
            id: paymentAttempts.id,
            articleId: paymentAttempts.articleId,
            expectedAmountAtomic: paymentAttempts.expectedAmountAtomic,
            assetAddress: paymentAttempts.assetAddress,
            status: paymentAttempts.status,
            network: paymentAttempts.network,
            createdAt: paymentAttempts.createdAt,
        });

    return {
        ...attempt,
        expectedAmountAtomic: attempt.expectedAmountAtomic.toString(),
    };
}

export async function markPaymentAttemptAsRequired(
    attemptId: string,
    data: {
        payerWallet?: string | null;
        queryId?: string | null;
        lastError?: string | null;
    } = {},
) {
    const db = getDb();
    const values = {
        status: "payment_required",
        updatedAt: new Date(),
    } as any;

    if (data.payerWallet !== undefined) values.payerWallet = data.payerWallet ?? null;
    if (data.queryId !== undefined) values.queryId = data.queryId ?? null;
    if (data.lastError !== undefined) values.lastError = data.lastError ?? null;

    await db.update(paymentAttempts).set(values).where(eq(paymentAttempts.id, attemptId));
}

export async function recordConfirmedArticleUnlock(args: {
    articleId: string;
    paymentAttemptId?: string | null;
    payerWallet: string;
    txHash: string;
    queryId?: string | null;
    network: string;
    assetAddress: string;
    amountAtomic: string;
}) {
    const db = getDb();
    const article = await getPublishedArticleById(args.articleId);
    if (!article) {
        throw new Error("Article not found");
    }

    const paymentAttemptId = args.paymentAttemptId ?? createId("pat");
    const confirmedPaymentId = createId("pay");

    await db.transaction(async (tx) => {
        await tx
            .insert(paymentAttempts)
            .values({
                id: paymentAttemptId,
                articleId: args.articleId,
                payerWallet: args.payerWallet,
                expectedAmountAtomic: BigInt(args.amountAtomic),
                assetAddress: args.assetAddress,
                network: args.network,
                status: "confirmed",
                paymentMethod: "x402",
                facilitatorUrl: process.env.FACILITATOR_URL,
                queryId: args.queryId ?? null,
                txHash: args.txHash,
                metadata: {
                    pricingTier: getPriceTier(article.readCount).label,
                },
            } as any)
            .onConflictDoUpdate({
                target: paymentAttempts.id,
                set: {
                    payerWallet: args.payerWallet,
                    expectedAmountAtomic: BigInt(args.amountAtomic),
                    assetAddress: args.assetAddress,
                    network: args.network,
                    status: "confirmed",
                    queryId: args.queryId ?? null,
                    txHash: args.txHash,
                    updatedAt: new Date(),
                } as any,
            });

        await tx
            .insert(confirmedPayments)
            .values({
                id: confirmedPaymentId,
                paymentAttemptId,
                articleId: args.articleId,
                payerWallet: args.payerWallet,
                totalAmountAtomic: BigInt(args.amountAtomic),
                assetAddress: args.assetAddress,
                network: args.network,
                txHash: args.txHash,
                queryId: args.queryId ?? null,
                rawReceipt: {
                    txHash: args.txHash,
                    queryId: args.queryId ?? null,
                },
            } as any)
            .onConflictDoNothing();

        const [confirmed] = await tx
            .select({ id: confirmedPayments.id })
            .from(confirmedPayments)
            .where(eq(confirmedPayments.paymentAttemptId, paymentAttemptId))
            .limit(1);

        if (!confirmed) {
            throw new Error("Failed to persist confirmed payment");
        }

        await tx
            .insert(unlockGrants)
            .values({
                id: createId("unlock"),
                articleId: args.articleId,
                confirmedPaymentId: confirmed.id,
                granteeWallet: args.payerWallet,
            } as any)
            .onConflictDoUpdate({
                target: [unlockGrants.articleId, unlockGrants.granteeWallet],
                set: {
                    confirmedPaymentId: confirmed.id,
                    grantedAt: new Date(),
                    revokedAt: null,
                } as any,
            });

        await tx
            .update(articleMetrics)
            .set({
                readCount: sql`${articleMetrics.readCount} + 1`,
                updatedAt: new Date(),
            } as any)
            .where(eq(articleMetrics.articleId, args.articleId));
    });

    return getPublishedArticleById(args.articleId);
}

async function getContributorsForArticles(articleIds: string[]) {
    const contributorsByArticle = new Map<string, HydratedContributor[]>();
    if (articleIds.length === 0) return contributorsByArticle;

    const db = getDb();
    const rows = await db
        .select({
            articleId: articleContributors.articleId,
            contributorId: contributors.id,
            name: contributors.name,
            wallet: contributors.wallet,
            role: articleContributors.role,
            splitPercent: articleContributors.splitPercent,
            sortOrder: articleContributors.sortOrder,
        })
        .from(articleContributors)
        .innerJoin(contributors, eq(contributors.id, articleContributors.contributorId))
        .where(inArray(articleContributors.articleId, articleIds))
        .orderBy(asc(articleContributors.sortOrder));

    for (const row of rows) {
        const current = contributorsByArticle.get(row.articleId) ?? [];
        current.push({
            id: row.contributorId,
            name: row.name,
            wallet: row.wallet,
            role: row.role,
            percent: row.splitPercent,
        });
        contributorsByArticle.set(row.articleId, current);
    }

    return contributorsByArticle;
}
