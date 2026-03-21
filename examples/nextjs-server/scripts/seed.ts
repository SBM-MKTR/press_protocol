import { getDb } from "../lib/db/client";
import { DEMO_ARTICLES } from "../lib/demo-content";
import { createId } from "../lib/db/ids";
import {
    articleContributors,
    articleMetrics,
    articles,
    contributors,
} from "../lib/db/schema";

async function main() {
    const db = getDb();

    for (const article of DEMO_ARTICLES) {
        await db
            .insert(articles)
            .values({
                id: article.id,
                slug: article.slug,
                title: article.title,
                authorName: article.authorName,
                location: article.location,
                category: article.category,
                preview: article.preview,
                content: article.content,
                isPublished: true,
                updatedAt: new Date(),
            } as any)
            .onConflictDoUpdate({
                target: articles.id,
                set: {
                    slug: article.slug,
                    title: article.title,
                    authorName: article.authorName,
                    location: article.location,
                    category: article.category,
                    preview: article.preview,
                    content: article.content,
                    isPublished: true,
                    updatedAt: new Date(),
                } as any,
            });

        await db
            .insert(articleMetrics)
            .values({
                articleId: article.id,
                readCount: article.readCount,
                updatedAt: new Date(),
            } as any)
            .onConflictDoUpdate({
                target: articleMetrics.articleId,
                set: {
                    readCount: article.readCount,
                    updatedAt: new Date(),
                } as any,
            });

        for (const contributor of article.contributors) {
            await db
                .insert(contributors)
                .values({
                    id: contributor.id,
                    name: contributor.name,
                    wallet: contributor.wallet,
                    telegramHandle: contributor.telegramHandle ?? null,
                } as any)
                .onConflictDoUpdate({
                    target: contributors.id,
                    set: {
                        name: contributor.name,
                        wallet: contributor.wallet,
                        telegramHandle: contributor.telegramHandle ?? null,
                    } as any,
                });

            await db
                .insert(articleContributors)
                .values({
                    id: createId("ac"),
                    articleId: article.id,
                    contributorId: contributor.id,
                    role: contributor.role,
                    splitPercent: contributor.percent,
                    sortOrder: article.contributors.findIndex((item) => item.id === contributor.id),
                } as any)
                .onConflictDoUpdate({
                    target: [
                        articleContributors.articleId,
                        articleContributors.contributorId,
                        articleContributors.role,
                    ],
                    set: {
                        splitPercent: contributor.percent,
                        sortOrder: article.contributors.findIndex((item) => item.id === contributor.id),
                    } as any,
                });
        }
    }

    console.log(`Seeded ${DEMO_ARTICLES.length} articles.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
