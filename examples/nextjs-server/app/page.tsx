"use client";
import { useState, useEffect } from "react";

const STATS = [
  { value: "900M", label: "Telegram users" },
  { value: "1.6M", label: "Unmonetized journalists" },
  { value: "0%", label: "Platform cut" },
  { value: "<2s", label: "Payment speed" },
];

const INNOVATIONS = [
  {
    icon: "⚡",
    title: "Atomic split payments",
    description: "One reader payment automatically splits between journalist, editor, translator, and photographer — in a single TON transaction. No invoices. No waiting. No middleman.",
    color: "#14b8a6",
  },
  {
    icon: "📈",
    title: "Dynamic pricing",
    description: "Article prices rise with readership. Early supporters pay less. Creates a live information market where value is set by readers, not advertisers.",
    color: "#6366f1",
  },
  {
    icon: "🛡️",
    title: "Censorship-resistant income",
    description: "TON wallet + Telegram = no bank needed. No platform can freeze payments. Works in Russia, Iran, Nigeria, Myanmar — anywhere Telegram works.",
    color: "#f59e0b",
  },
];

type Article = {
  id: string;
  title: string;
  author: string;
  location: string;
  category: string;
  preview: string;
  priceDisplay: string;
  readCount: number;
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/articles")
      .then(r => r.json())
      .then(d => setArticles(d.articles || []));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", padding: "1.25rem 2rem", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, background: "#0a0f1eee", backdropFilter: "blur(10px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Press Protocol</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a href="/feed" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>Articles</a>
          <a href="/register" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>Publish</a>
          <a href="/about" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>About</a>
          <a href="/press" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Read Now</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "5rem 2rem 3rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#14b8a6", marginBottom: "1.5rem" }}>
          Built on TON · Distributed through Telegram
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-1px" }}>
          The first payment layer<br />
          <span style={{ color: "#14b8a6" }}>for global journalism</span>
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 2.5rem" }}>
          Any journalist, anywhere in the world, gets paid directly by their readers in BSA USD stablecoin. No bank. No middleman. No platform taking a cut.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/press" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "14px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>Read an article</a>
          <a href="/register" style={{ background: "transparent", color: "white", padding: "14px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none", border: "1px solid #1e293b" }}>Publish your story</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#14b8a6", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Innovations */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 2rem" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: "2rem" }}>Three innovations that change everything</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {INNOVATIONS.map(inn => (
            <div key={inn.title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{inn.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: inn.color }}>{inn.title}</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{inn.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured articles */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 2rem 4rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Featured stories</h2>
          <a href="/feed" style={{ color: "#14b8a6", fontSize: 14, textDecoration: "none" }}>View all →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {articles.slice(0, 4).map(article => (
            <a key={article.id} href="/press" style={{ textDecoration: "none" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.25rem", cursor: "pointer", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{article.category}</span>
                  <span style={{ background: "#1e293b", color: "#64748b", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{article.location}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 8, lineHeight: 1.4 }}>{article.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 12 }}>{article.preview.slice(0, 100)}...</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>By {article.author}</span>
                  <span style={{ fontSize: 12, color: "#14b8a6", fontWeight: 600 }}>{article.priceDisplay}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e293b", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ background: "#14b8a6", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#0a0f1e" }}>P</div>
          <span style={{ fontWeight: 600, color: "#94a3b8" }}>Press Protocol</span>
        </div>
        <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>Built on TON · Powered by x402 · Distributed through Telegram</p>
      </div>

    </div>
  );
}