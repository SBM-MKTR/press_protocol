"use client";
import { useState, useEffect } from "react";

const CATEGORIES = ["All", "Investigative", "Corruption", "Press Freedom", "Accountability", "Climate", "Conflict", "Environment"];

type Article = {
  id: string;
  title: string;
  author: string;
  location: string;
  category: string;
  preview: string;
  priceDisplay: string;
  readCount: number;
  contributors: { role: string; percent: number }[];
};

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"popular" | "newest" | "price">("popular");

  useEffect(() => {
    fetch("/api/articles")
      .then(r => r.json())
      .then(d => {
        setArticles(d.articles || []);
        setFiltered(d.articles || []);
      });
  }, []);

  useEffect(() => {
    let result = [...articles];
    if (category !== "All") result = result.filter(a => a.category === category);
    if (sort === "popular") result.sort((a, b) => b.readCount - a.readCount);
    if (sort === "price") result.sort((a, b) => parseFloat(a.priceDisplay) - parseFloat(b.priceDisplay));
    setFiltered(result);
  }, [category, sort, articles]);

  const getPriceTier = (readCount: number) => {
    if (readCount < 100) return { label: "Early", color: "#14b8a6" };
    if (readCount < 1000) return { label: "Growing", color: "#6366f1" };
    return { label: "Established", color: "#f59e0b" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", padding: "1.25rem 2rem", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, background: "#0a0f1eee", backdropFilter: "blur(10px)", zIndex: 10 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Press Protocol</span>
        </a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <a href="/feed" style={{ color: "#14b8a6", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>Articles</a>
          <a href="/about" style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>About</a>
          <a href="/press?id=demo" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Read Now</a>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>All Stories</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>{filtered.length} stories from journalists worldwide · Paid directly in BSA USD</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid",
                borderColor: category === cat ? "#14b8a6" : "#1e293b",
                background: category === cat ? "#14b8a622" : "transparent",
                color: category === cat ? "#14b8a6" : "#64748b",
                fontSize: 13, cursor: "pointer"
              }}>{cat}</button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as any)} style={{
            background: "#0f172a", border: "1px solid #1e293b", color: "#94a3b8",
            padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer"
          }}>
            <option value="popular">Most read</option>
            <option value="newest">Newest</option>
            <option value="price">Lowest price</option>
          </select>
        </div>

        {/* Articles grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(article => {
            const tier = getPriceTier(article.readCount);
            return (
              <a key={article.id} href={`/press?id=${article.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", cursor: "pointer" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{article.category}</span>
                    <span style={{ background: "#1e293b", color: "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{article.location}</span>
                    <span style={{ background: tier.color + "22", color: tier.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, marginLeft: "auto" }}>{tier.label} · {article.readCount.toLocaleString()} readers</span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: "white", marginBottom: 8, lineHeight: 1.4 }}>{article.title}</h2>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 16 }}>{article.preview}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, background: "#14b8a622", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#14b8a6", fontWeight: 600 }}>
                        {article.author.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{article.author}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>
                          {article.contributors.map(s => `${s.role} ${s.percent}%`).join(" · ")}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#14b8a6" }}>{article.priceDisplay}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>to read</div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e293b", padding: "2rem", textAlign: "center", marginTop: "3rem" }}>
        <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>Press Protocol · Built on TON · Powered by x402 · Distributed through Telegram</p>
      </div>

    </div>
  );
}
