"use client";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", padding: "1.25rem 2rem", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, background: "#0a0f1eee", backdropFilter: "blur(10px)", zIndex: 10 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Press Protocol</span>
        </a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a href="/feed" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>Articles</a>
          <a href="/register" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>Publish</a>
          <a href="/about" style={{ color: "#14b8a6", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>About</a>
          <a href="/press" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Read Now</a>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 2rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-block", background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#14b8a6", marginBottom: "1.5rem" }}>
            Our mission
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: "1.5rem" }}>
            Journalism is dying.<br />
            <span style={{ color: "#14b8a6" }}>We're fixing the money.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7 }}>
            There are 2 million professional journalists in the world. Less than 20% have reliable income. Press Protocol exists for the other 1.6 million — and the hundreds of millions of citizen journalists, translators, photographers, and fixers who make global journalism possible but currently get paid nothing.
          </p>
        </div>

        {/* Problem */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: "1.5rem" }}>The problem</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: "🏦", title: "No bank access", desc: "A journalist in Nigeria, Myanmar, or Belarus can't receive Stripe payments. They can't open a PayPal account. Their bank gets frozen. Their income disappears." },
              { icon: "📉", title: "Middlemen take everything", desc: "A NYT subscription: the journalist sees 3% of what you paid. Substack takes 10%. Patreon takes 8%. The people doing the work see the least." },
              { icon: "🔇", title: "Platforms silence them", desc: "YouTube demonetizes. PayPal freezes accounts. Governments pressure platforms. There is no censorship-resistant way to get paid for journalism." },
              { icon: "⏳", title: "Payment takes months", desc: "Freelance journalists invoice and wait 30, 60, sometimes 90 days. Many are never paid at all. The investigation gets done. The money doesn't arrive." },
            ].map(p => (
              <div key={p.title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.25rem" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "white" }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Solution */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: "1.5rem" }}>Our solution</h2>
          {[
            { num: "01", color: "#14b8a6", title: "Atomic split payments", desc: "One reader payment automatically splits between journalist, editor, translator, and photographer in a single TON transaction. Every person in the production chain gets paid in the same moment, with mathematical certainty, with no invoice and no NET-90 payment terms." },
            { num: "02", color: "#6366f1", title: "Dynamic pricing", desc: "Each article is a live market. Prices rise with readership — early supporters pay less, established stories charge more. This creates an information market where value is set by readers, not advertisers. Pre-payments fund investigations before they're written." },
            { num: "03", color: "#f59e0b", title: "Censorship-resistant income", desc: "TON wallet + Telegram = no bank needed. No platform can freeze payments. A journalist in Belarus gets paid by readers in Germany. A reporter in Myanmar receives funds from supporters in Japan. Their income stream cannot be seized, frozen, or blocked." },
          ].map(s => (
            <div key={s.num} style={{ display: "flex", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #1e293b" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, opacity: 0.3, minWidth: 48 }}>{s.num}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: s.color, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: "1.5rem" }}>Built on</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { name: "TON Blockchain", desc: "Sub-2s transactions at fraction of a cent" },
              { name: "x402 Protocol", desc: "HTTP micropayments — pay per API call" },
              { name: "BSA USD", desc: "TEP-74 stablecoin — no volatility risk" },
              { name: "Telegram Mini App", desc: "900M users, zero app store friction" },
              { name: "Next.js 15", desc: "Production-grade web infrastructure" },
              { name: "Vercel", desc: "Global edge deployment" },
            ].map(t => (
              <div key={t.name} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1rem" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#14b8a6", marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: "1.5rem" }}>Team</h2>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { name: "Mohamed Moussa", role: "Backend & Blockchain", init: "MM" },
              { name: "Sohaib MS", role: "Frontend & Design", init: "SMS" },
            ].map(m => (
              <div key={m.name} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", flex: 1, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, background: "#14b8a622", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 18, fontWeight: 700, color: "#14b8a6" }}>{m.init}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "2.5rem", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: "2rem", lineHeight: 1.7 }}>Read journalism that matters. Pay journalists directly. Or publish your own story and get paid instantly.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <a href="/press" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>Read an article</a>
            <a href="/register" style={{ background: "transparent", color: "white", padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1px solid #1e293b" }}>Publish your story</a>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e293b", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>Press Protocol · Built on TON · Powered by x402 · Distributed through Telegram · EPFL Hackathon 2026</p>
      </div>

    </div>
  );
}