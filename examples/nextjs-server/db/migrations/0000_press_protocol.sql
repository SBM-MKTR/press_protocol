create type contributor_role as enum ('Journalist', 'Editor', 'Translator', 'Photographer', 'Protocol');
--> statement-breakpoint
create type payment_attempt_status as enum ('created', 'payment_required', 'submitted', 'confirmed', 'failed');
--> statement-breakpoint
create type payment_method as enum ('x402', 'tonconnect');
--> statement-breakpoint
create table if not exists articles (
    id text primary key,
    slug text not null,
    title text not null,
    author_name text not null,
    location text not null,
    category text not null,
    preview text not null,
    content text not null,
    is_published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
--> statement-breakpoint
create unique index if not exists articles_slug_idx on articles (slug);
--> statement-breakpoint
create index if not exists articles_published_idx on articles (is_published);
--> statement-breakpoint
create table if not exists contributors (
    id text primary key,
    name text not null,
    wallet text not null,
    telegram_handle text,
    bio text,
    created_at timestamptz not null default now()
);
--> statement-breakpoint
create index if not exists contributors_wallet_idx on contributors (wallet);
--> statement-breakpoint
create table if not exists article_contributors (
    id text primary key,
    article_id text not null references articles(id) on delete cascade,
    contributor_id text not null references contributors(id) on delete cascade,
    role contributor_role not null,
    split_percent integer not null,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);
--> statement-breakpoint
create unique index if not exists article_contributors_unique_member_idx on article_contributors (article_id, contributor_id, role);
--> statement-breakpoint
create index if not exists article_contributors_article_idx on article_contributors (article_id, sort_order);
--> statement-breakpoint
create table if not exists article_metrics (
    article_id text primary key references articles(id) on delete cascade,
    read_count integer not null default 0,
    updated_at timestamptz not null default now()
);
--> statement-breakpoint
create table if not exists payment_attempts (
    id text primary key,
    article_id text not null references articles(id) on delete cascade,
    payer_wallet text,
    expected_amount_atomic bigint not null,
    asset_address text not null,
    network text not null,
    status payment_attempt_status not null default 'created',
    payment_method payment_method not null default 'x402',
    facilitator_url text,
    query_id text,
    tx_hash text,
    last_error text,
    metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
--> statement-breakpoint
create index if not exists payment_attempts_article_idx on payment_attempts (article_id, created_at);
--> statement-breakpoint
create index if not exists payment_attempts_query_idx on payment_attempts (query_id);
--> statement-breakpoint
create index if not exists payment_attempts_tx_hash_idx on payment_attempts (tx_hash);
--> statement-breakpoint
create table if not exists confirmed_payments (
    id text primary key,
    payment_attempt_id text not null references payment_attempts(id) on delete cascade,
    article_id text not null references articles(id) on delete cascade,
    payer_wallet text not null,
    total_amount_atomic bigint not null,
    asset_address text not null,
    network text not null,
    tx_hash text not null,
    query_id text,
    raw_receipt jsonb,
    settled_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);
--> statement-breakpoint
create unique index if not exists confirmed_payments_attempt_unique_idx on confirmed_payments (payment_attempt_id);
--> statement-breakpoint
create unique index if not exists confirmed_payments_tx_hash_unique_idx on confirmed_payments (tx_hash);
--> statement-breakpoint
create table if not exists unlock_grants (
    id text primary key,
    article_id text not null references articles(id) on delete cascade,
    confirmed_payment_id text not null references confirmed_payments(id) on delete cascade,
    grantee_wallet text not null,
    granted_at timestamptz not null default now(),
    revoked_at timestamptz
);
--> statement-breakpoint
create unique index if not exists unlock_grants_wallet_article_unique_idx on unlock_grants (article_id, grantee_wallet);
--> statement-breakpoint
create table if not exists press_migrations (
    id text primary key,
    name text not null,
    executed_at timestamptz not null default now()
);
--> statement-breakpoint
create unique index if not exists press_migrations_name_unique_idx on press_migrations (name);
