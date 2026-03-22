import Link from "next/link";

const setupSteps = [
    {
        title: "Configure the database",
        body: "Create a Postgres database, set DATABASE_URL in examples/nextjs-server/.env.local, then run the Drizzle migration and seed scripts.",
        code: "pnpm db:migrate\npnpm db:seed",
    },
    {
        title: "Configure TON payment runtime",
        body: "Set your testnet payment recipient, BSA USD jetton master address, facilitator URL, and TON RPC credentials so the backend can verify and settle unlock payments.",
        code: "PAYMENT_ADDRESS=...\nJETTON_MASTER_ADDRESS=...\nFACILITATOR_URL=...\nTON_RPC_URL=...\nRPC_API_KEY=...",
    },
    {
        title: "Configure Mini App deployment",
        body: "Set NEXT_PUBLIC_APP_URL to the exact Vercel domain or custom domain you will open inside Telegram. TonConnect uses this URL to resolve the manifest and validate wallet handoff.",
        code: "NEXT_PUBLIC_APP_URL=https://your-deployment.vercel.app",
    },
    {
        title: "Run the app",
        body: "Install dependencies, start the Next.js app, and open /press?id=demo locally or through your Vercel preview deployment.",
        code: "pnpm install\npnpm dev",
    },
];

export default function QuickstartPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Press Protocol</span>
                    </Link>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "inline-block", background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#14b8a6", marginBottom: "1rem" }}>
                        Builder setup
                    </div>
                    <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem" }}>
                        Launch Press Protocol locally or on Vercel
                    </h1>
                    <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, maxWidth: 680 }}>
                        This page is for developers validating the current MVP: Telegram Mini App shell, TonConnect wallet handoff, DB-backed article access, and TON testnet payment verification.
                    </p>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                    {setupSteps.map((step, index) => (
                        <div
                            key={step.title}
                            style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: "1.25rem" }}
                        >
                            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                                Step {String(index + 1).padStart(2, "0")}
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{step.title}</h2>
                            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: "1rem" }}>{step.body}</p>
                            <pre style={{ margin: 0, overflowX: "auto", background: "#020617", borderRadius: 12, padding: "1rem", fontSize: 13, color: "#bfdbfe" }}>
                                <code>{step.code}</code>
                            </pre>
                        </div>
                    ))}
                </div>

                <div style={{ background: "#082f49", border: "1px solid #0ea5e9", borderRadius: 18, padding: "1.25rem", marginTop: "2rem" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Current MVP truth</div>
                    <p style={{ fontSize: 14, color: "#bfdbfe", lineHeight: 1.7, margin: 0 }}>
                        Article access, payment attempts, confirmed payments, and unlock grants are persisted in Postgres. TonConnect is live for wallet handoff. Contributor split percentages are modeled and displayed, but atomic on-chain split routing is still a follow-up milestone.
                    </p>
                </div>
            </div>
        </div>
    );
}
