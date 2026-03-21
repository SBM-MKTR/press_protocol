import {
    bigint,
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const contributorRoleEnum = pgEnum("contributor_role", [
    "Journalist",
    "Editor",
    "Translator",
    "Photographer",
    "Protocol",
]);

export const paymentAttemptStatusEnum = pgEnum("payment_attempt_status", [
    "created",
    "payment_required",
    "submitted",
    "confirmed",
    "failed",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["x402", "tonconnect"]);

export const articles = pgTable(
    "articles",
    {
        id: text("id").primaryKey(),
        slug: text("slug").notNull(),
        title: text("title").notNull(),
        authorName: text("author_name").notNull(),
        location: text("location").notNull(),
        category: text("category").notNull(),
        preview: text("preview").notNull(),
        content: text("content").notNull(),
        isPublished: boolean("is_published").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        slugIdx: uniqueIndex("articles_slug_idx").on(table.slug),
        publishedIdx: index("articles_published_idx").on(table.isPublished),
    }),
);

export const contributors = pgTable(
    "contributors",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        wallet: text("wallet").notNull(),
        telegramHandle: text("telegram_handle"),
        bio: text("bio"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        walletIdx: index("contributors_wallet_idx").on(table.wallet),
    }),
);

export const articleContributors = pgTable(
    "article_contributors",
    {
        id: text("id").primaryKey(),
        articleId: text("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
        contributorId: text("contributor_id").notNull().references(() => contributors.id, { onDelete: "cascade" }),
        role: contributorRoleEnum("role").notNull(),
        splitPercent: integer("split_percent").notNull(),
        sortOrder: integer("sort_order").notNull().default(0),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        uniqueMemberIdx: uniqueIndex("article_contributors_unique_member_idx").on(
            table.articleId,
            table.contributorId,
            table.role,
        ),
        articleIdx: index("article_contributors_article_idx").on(table.articleId, table.sortOrder),
    }),
);

export const articleMetrics = pgTable("article_metrics", {
    articleId: text("article_id")
        .primaryKey()
        .references(() => articles.id, { onDelete: "cascade" }),
    readCount: integer("read_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentAttempts = pgTable(
    "payment_attempts",
    {
        id: text("id").primaryKey(),
        articleId: text("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
        payerWallet: text("payer_wallet"),
        expectedAmountAtomic: bigint("expected_amount_atomic", { mode: "bigint" }).notNull(),
        assetAddress: text("asset_address").notNull(),
        network: text("network").notNull(),
        status: paymentAttemptStatusEnum("status").notNull().default("created"),
        paymentMethod: paymentMethodEnum("payment_method").notNull().default("x402"),
        facilitatorUrl: text("facilitator_url"),
        queryId: text("query_id"),
        txHash: text("tx_hash"),
        lastError: text("last_error"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        articleIdx: index("payment_attempts_article_idx").on(table.articleId, table.createdAt),
        queryIdx: index("payment_attempts_query_idx").on(table.queryId),
        txHashIdx: index("payment_attempts_tx_hash_idx").on(table.txHash),
    }),
);

export const confirmedPayments = pgTable(
    "confirmed_payments",
    {
        id: text("id").primaryKey(),
        paymentAttemptId: text("payment_attempt_id")
            .notNull()
            .references(() => paymentAttempts.id, { onDelete: "cascade" }),
        articleId: text("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
        payerWallet: text("payer_wallet").notNull(),
        totalAmountAtomic: bigint("total_amount_atomic", { mode: "bigint" }).notNull(),
        assetAddress: text("asset_address").notNull(),
        network: text("network").notNull(),
        txHash: text("tx_hash").notNull(),
        queryId: text("query_id"),
        rawReceipt: jsonb("raw_receipt"),
        settledAt: timestamp("settled_at", { withTimezone: true }).notNull().defaultNow(),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        attemptUniqueIdx: uniqueIndex("confirmed_payments_attempt_unique_idx").on(table.paymentAttemptId),
        txHashUniqueIdx: uniqueIndex("confirmed_payments_tx_hash_unique_idx").on(table.txHash),
    }),
);

export const unlockGrants = pgTable(
    "unlock_grants",
    {
        id: text("id").primaryKey(),
        articleId: text("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
        confirmedPaymentId: text("confirmed_payment_id")
            .notNull()
            .references(() => confirmedPayments.id, { onDelete: "cascade" }),
        granteeWallet: text("grantee_wallet").notNull(),
        grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
    },
    (table) => ({
        walletArticleUniqueIdx: uniqueIndex("unlock_grants_wallet_article_unique_idx").on(
            table.articleId,
            table.granteeWallet,
        ),
    }),
);

export const schemaMigrations = pgTable(
    "press_migrations",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        executedAt: timestamp("executed_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        nameUniqueIdx: uniqueIndex("press_migrations_name_unique_idx").on(table.name),
    }),
);
