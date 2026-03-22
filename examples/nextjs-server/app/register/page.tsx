import Link from "next/link";

export default function RegisterPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Press Protocol</span>
                    </Link>
                </div>

                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "2rem" }}>
                    <div style={{ display: "inline-block", background: "#f59e0b22", color: "#fbbf24", border: "1px solid #f59e0b44", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, marginBottom: "1rem" }}>
                        Roadmap surface
                    </div>
                    <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem" }}>
                        Contributor publishing is not in the shipped MVP yet
                    </h1>
                    <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                        The live product path for the hackathon is the reader unlock flow: browse a story, inspect the contributor economics, pay with a TON wallet, and restore access by wallet. Publisher onboarding and contributor setup are planned next, but this page is intentionally not part of the live demo claim.
                    </p>

                    <div style={{ background: "#020617", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#14b8a6", marginBottom: 10 }}>Planned next</div>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#cbd5e1", lineHeight: 1.8, fontSize: 14 }}>
                            <li>Real contributor onboarding with wallet validation</li>
                            <li>Article creation backed by the Press Protocol database</li>
                            <li>Contributor split authoring that feeds the payment settlement layer</li>
                            <li>Editorial workflow and draft publishing controls</li>
                        </ul>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <Link href="/press?id=demo" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "12px 22px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                            Open the live article demo
                        </Link>
                        <Link href="/feed" style={{ background: "transparent", color: "white", padding: "12px 22px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1px solid #1e293b" }}>
                            Browse the feed
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
