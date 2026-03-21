import { and, asc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { createId } from "../db/ids";
import { getPaymentRuntimeEnv } from "../env";
import {
    articleContributors,
    articleMetrics,
    articles,
    confirmedPayments,
    contributors,
    paymentAttempts,
    unlockGrants,
} from "../db/schema";
import { getPriceTier } from "../pricing";

export type HydratedContributor = {
    id: string;
    name: string;
    wallet: string;
    role: "Journalist" | "Editor" | "Translator" | "Photographer" | "Protocol";
    percent: number;
};

export type HydratedArticle = {
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

export type PaymentAttemptSummary = {
    id: string;
    articleId: string;
    expectedAmountAtomic: string;
    assetAddress: string;
    status: string;
    network: string;
    paymentMethod: "x402" | "tonconnect";
    payerWallet: string | null;
    txHash: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ArticleAccessSummary = {
    articleId: string;
    wallet: string;
    unlocked: boolean;
    unlockGrant: null | {
        id: string;
        grantedAt: Date;
        confirmedPaymentId: string;
    };
    confirmedPayment: null | {
        id: string;
        paymentAttemptId: string;
        txHash: string;
        amountAtomic: string;
        assetAddress: string;
        network: string;
        settledAt: Date;
    };
};

export type PaymentAttemptDetails = {
    id: string;
    articleId: string;
    payerWallet: string | null;
    expectedAmountAtomic: string;
    assetAddress: string;
    network: string;
    status: string;
    paymentMethod: "x402" | "tonconnect";
    facilitatorUrl: string | null;
    queryId: string | null;
    txHash: string | null;
    lastError: string | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedPayment: null | {
        id: string;
        txHash: string;
        payerWallet: string;
        totalAmountAtomic: string;
        assetAddress: string;
        network: string;
        settledAt: Date;
    };
    unlockGrant: null | {
        id: string;
        granteeWallet: string;
        grantedAt: Date;
        revokedAt: Date | null;
    };
};

type CreatePaymentAttemptOptions = {
    paymentMethod?: "x402" | "tonconnect";
    payerWallet?: string | null;
    metadata?: Record<string, unknown> | null;
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

export async function getArticlePaywallSnapshot(id: string) {
    const article = await getPublishedArticleById(id);
    if (!article) return null;

    const price = getPriceTier(article.readCount);
    const env = getPaymentRuntimeEnv();

    return {
        articleId: article.id,
        priceAtomic: price.amountAtomic,
        priceDisplay: price.display,
        priceTier: price.label,
        readCount: article.readCount,
        assetAddress:
            env.jettonMasterAddress ??
            "kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW",
        contributors: article.contributors,
    };
}

export async function createPaymentAttemptForArticle(
    id: string,
    options: CreatePaymentAttemptOptions = {},
): Promise<PaymentAttemptSummary | null> {
    const db = getDb();
    const article = await getPublishedArticleById(id);
    if (!article) return null;

    const price = getPriceTier(article.readCount);
    const env = getPaymentRuntimeEnv();
    const assetAddress =
        env.jettonMasterAddress ??
        "kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW";

    const attemptId = createId("pat");
    const [attempt] = await db
        .insert(paymentAttempts)
        .values({
            id: attemptId,
            articleId: id,
            payerWallet: normalizeWallet(options.payerWallet),
            expectedAmountAtomic: BigInt(price.amountAtomic),
            assetAddress,
            network: env.tonNetwork,
            status: "created",
            paymentMethod: options.paymentMethod ?? "x402",
            facilitatorUrl: env.facilitatorUrl,
            metadata: {
                articleSlug: article.slug,
                pricingTier: price.label,
                ...(options.metadata ?? {}),
            },
        } as any)
        .returning({
            id: paymentAttempts.id,
            articleId: paymentAttempts.articleId,
            payerWallet: paymentAttempts.payerWallet,
            expectedAmountAtomic: paymentAttempts.expectedAmountAtomic,
            assetAddress: paymentAttempts.assetAddress,
            status: paymentAttempts.status,
            network: paymentAttempts.network,
            paymentMethod: paymentAttempts.paymentMethod,
            txHash: paymentAttempts.txHash,
            createdAt: paymentAttempts.createdAt,
            updatedAt: paymentAttempts.updatedAt,
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

    if (data.payerWallet !== undefined) values.payerWallet = normalizeWallet(data.payerWallet);
    if (data.queryId !== undefined) values.queryId = data.queryId ?? null;
    if (data.lastError !== undefined) values.lastError = data.lastError ?? null;

    await db.update(paymentAttempts).set(values).where(eq(paymentAttempts.id, attemptId));
}

export async function markPaymentAttemptAsSubmitted(
    attemptId: string,
    data: {
        payerWallet?: string | null;
        txHash?: string | null;
        queryId?: string | null;
        paymentMethod?: "x402" | "tonconnect";
    } = {},
) {
    const db = getDb();
    const values = {
        status: "submitted",
        updatedAt: new Date(),
    } as any;

    if (data.payerWallet !== undefined) values.payerWallet = normalizeWallet(data.payerWallet);
    if (data.txHash !== undefined) values.txHash = data.txHash ?? null;
    if (data.queryId !== undefined) values.queryId = data.queryId ?? null;
    if (data.paymentMethod !== undefined) values.paymentMethod = data.paymentMethod;

    await db.update(paymentAttempts).set(values).where(eq(paymentAttempts.id, attemptId));
}

export async function markPaymentAttemptAsFailed(
    attemptId: string,
    lastError: string,
) {
    const db = getDb();
    await db
        .update(paymentAttempts)
        .set({
            status: "failed",
            lastError,
            updatedAt: new Date(),
        } as any)
        .where(eq(paymentAttempts.id, attemptId));
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

    const payerWallet = normalizeWallet(args.payerWallet);
    if (!payerWallet) {
        throw new Error("Missing payer wallet");
    }

    const paymentAttemptId = args.paymentAttemptId ?? createId("pat");
    const env = getPaymentRuntimeEnv();

    await db.transaction(async (tx) => {
        await tx
            .insert(paymentAttempts)
            .values({
                id: paymentAttemptId,
                articleId: args.articleId,
                payerWallet,
                expectedAmountAtomic: BigInt(args.amountAtomic),
                assetAddress: args.assetAddress,
                network: args.network,
                status: "confirmed",
                paymentMethod: "x402",
                facilitatorUrl: env.facilitatorUrl,
                queryId: args.queryId ?? null,
                txHash: args.txHash,
                metadata: {
                    pricingTier: getPriceTier(article.readCount).label,
                },
            } as any)
            .onConflictDoUpdate({
                target: paymentAttempts.id,
                set: {
                    payerWallet,
                    expectedAmountAtomic: BigInt(args.amountAtomic),
                    assetAddress: args.assetAddress,
                    network: args.network,
                    status: "confirmed",
                    queryId: args.queryId ?? null,
                    txHash: args.txHash,
                    updatedAt: new Date(),
                } as any,
            });

        const insertedConfirmedPayments = await tx
            .insert(confirmedPayments)
            .values({
                id: createId("pay"),
                paymentAttemptId,
                articleId: args.articleId,
                payerWallet,
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
            .onConflictDoNothing()
            .returning({
                id: confirmedPayments.id,
            });

        let confirmedPaymentId = insertedConfirmedPayments[0]?.id;
        if (!confirmedPaymentId) {
            const [existingConfirmedPayment] = await tx
                .select({ id: confirmedPayments.id })
                .from(confirmedPayments)
                .where(
                    or(
                        eq(confirmedPayments.paymentAttemptId, paymentAttemptId),
                        eq(confirmedPayments.txHash, args.txHash),
                    ),
                )
                .limit(1);

            confirmedPaymentId = existingConfirmedPayment?.id;
        }

        if (!confirmedPaymentId) {
            throw new Error("Failed to persist confirmed payment");
        }

        const insertedUnlockGrants = await tx
            .insert(unlockGrants)
            .values({
                id: createId("unlock"),
                articleId: args.articleId,
                confirmedPaymentId,
                granteeWallet: payerWallet,
            } as any)
            .onConflictDoNothing()
            .returning({
                id: unlockGrants.id,
            });

        if (insertedUnlockGrants.length === 0) {
            await tx
                .update(unlockGrants)
                .set({
                    confirmedPaymentId,
                    grantedAt: new Date(),
                    revokedAt: null,
                } as any)
                .where(
                    and(
                        eq(unlockGrants.articleId, args.articleId),
                        eq(unlockGrants.granteeWallet, payerWallet),
                    ),
                );
        } else {
            await tx
                .update(articleMetrics)
                .set({
                    readCount: sql`${articleMetrics.readCount} + 1`,
                    updatedAt: new Date(),
                } as any)
                .where(eq(articleMetrics.articleId, args.articleId));
        }
    });

    return getPublishedArticleById(args.articleId);
}

export async function getArticleAccessByWallet(
    articleId: string,
    wallet: string,
): Promise<ArticleAccessSummary | null> {
    const db = getDb();
    const normalizedWallet = normalizeWallet(wallet);
    const article = await getPublishedArticleById(articleId);
    if (!article || !normalizedWallet) return null;

    const [row] = await db
        .select({
            unlockGrantId: unlockGrants.id,
            grantedAt: unlockGrants.grantedAt,
            confirmedPaymentId: confirmedPayments.id,
            paymentAttemptId: confirmedPayments.paymentAttemptId,
            txHash: confirmedPayments.txHash,
            totalAmountAtomic: confirmedPayments.totalAmountAtomic,
            assetAddress: confirmedPayments.assetAddress,
            network: confirmedPayments.network,
            settledAt: confirmedPayments.settledAt,
        })
        .from(unlockGrants)
        .innerJoin(
            confirmedPayments,
            eq(confirmedPayments.id, unlockGrants.confirmedPaymentId),
        )
        .where(
            and(
                eq(unlockGrants.articleId, articleId),
                eq(unlockGrants.granteeWallet, normalizedWallet),
                isNull(unlockGrants.revokedAt),
            ),
        )
        .limit(1);

    if (!row) {
        return {
            articleId,
            wallet: normalizedWallet,
            unlocked: false,
            unlockGrant: null,
            confirmedPayment: null,
        };
    }

    return {
        articleId,
        wallet: normalizedWallet,
        unlocked: true,
        unlockGrant: {
            id: row.unlockGrantId,
            grantedAt: row.grantedAt,
            confirmedPaymentId: row.confirmedPaymentId,
        },
        confirmedPayment: {
            id: row.confirmedPaymentId,
            paymentAttemptId: row.paymentAttemptId,
            txHash: row.txHash,
            amountAtomic: row.totalAmountAtomic.toString(),
            assetAddress: row.assetAddress,
            network: row.network,
            settledAt: row.settledAt,
        },
    };
}

export async function getUnlockedArticleByWallet(
    articleId: string,
    wallet: string,
): Promise<HydratedArticle | null> {
    const access = await getArticleAccessByWallet(articleId, wallet);
    if (!access?.unlocked) {
        return null;
    }

    return getPublishedArticleById(articleId);
}

export async function getPaymentAttemptById(
    attemptId: string,
): Promise<PaymentAttemptDetails | null> {
    const db = getDb();
    const [row] = await db
        .select({
            id: paymentAttempts.id,
            articleId: paymentAttempts.articleId,
            payerWallet: paymentAttempts.payerWallet,
            expectedAmountAtomic: paymentAttempts.expectedAmountAtomic,
            assetAddress: paymentAttempts.assetAddress,
            network: paymentAttempts.network,
            status: paymentAttempts.status,
            paymentMethod: paymentAttempts.paymentMethod,
            facilitatorUrl: paymentAttempts.facilitatorUrl,
            queryId: paymentAttempts.queryId,
            txHash: paymentAttempts.txHash,
            lastError: paymentAttempts.lastError,
            createdAt: paymentAttempts.createdAt,
            updatedAt: paymentAttempts.updatedAt,
            confirmedPaymentId: confirmedPayments.id,
            confirmedPaymentTxHash: confirmedPayments.txHash,
            confirmedPaymentPayerWallet: confirmedPayments.payerWallet,
            confirmedPaymentAmount: confirmedPayments.totalAmountAtomic,
            confirmedPaymentAssetAddress: confirmedPayments.assetAddress,
            confirmedPaymentNetwork: confirmedPayments.network,
            confirmedPaymentSettledAt: confirmedPayments.settledAt,
            unlockGrantId: unlockGrants.id,
            unlockGrantWallet: unlockGrants.granteeWallet,
            unlockGrantedAt: unlockGrants.grantedAt,
            unlockRevokedAt: unlockGrants.revokedAt,
        })
        .from(paymentAttempts)
        .leftJoin(
            confirmedPayments,
            eq(confirmedPayments.paymentAttemptId, paymentAttempts.id),
        )
        .leftJoin(
            unlockGrants,
            eq(unlockGrants.confirmedPaymentId, confirmedPayments.id),
        )
        .where(eq(paymentAttempts.id, attemptId))
        .limit(1);

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        articleId: row.articleId,
        payerWallet: row.payerWallet,
        expectedAmountAtomic: row.expectedAmountAtomic.toString(),
        assetAddress: row.assetAddress,
        network: row.network,
        status: row.status,
        paymentMethod: row.paymentMethod,
        facilitatorUrl: row.facilitatorUrl,
        queryId: row.queryId,
        txHash: row.txHash,
        lastError: row.lastError,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        confirmedPayment: row.confirmedPaymentId
            ? {
                id: row.confirmedPaymentId,
                txHash: row.confirmedPaymentTxHash ?? "",
                payerWallet: row.confirmedPaymentPayerWallet ?? "",
                totalAmountAtomic: row.confirmedPaymentAmount?.toString() ?? "0",
                assetAddress: row.confirmedPaymentAssetAddress ?? "",
                network: row.confirmedPaymentNetwork ?? "",
                settledAt: row.confirmedPaymentSettledAt ?? row.updatedAt,
            }
            : null,
        unlockGrant: row.unlockGrantId
            ? {
                id: row.unlockGrantId,
                granteeWallet: row.unlockGrantWallet ?? "",
                grantedAt: row.unlockGrantedAt ?? row.updatedAt,
                revokedAt: row.unlockRevokedAt,
            }
            : null,
    };
}

function normalizeWallet(wallet?: string | null): string | null {
    if (!wallet) return null;

    const normalized = wallet.trim();
    return normalized.length > 0 ? normalized : null;
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
