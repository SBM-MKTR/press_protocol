"use client";
import { useState } from "react";

const EARNINGS = [
  { month: "Oct", amount: 0.42 },
  { month: "Nov", amount: 0.89 },
  { month: "Dec", amount: 1.23 },
  { month: "Jan", amount: 0.97 },
  { month: "Feb", amount: 1.84 },
  { month: "Mar", amount: 2.31 },
];

const ARTICLES = [
  { title: "Water Crisis in Senegal", readers: 1847, earned: "1.847", tier: "Established", tierColor: "#f59e0b" },
  { title: "The $2 Billion Oil Theft", readers: 892, earned: "0.446", tier: "Growing", tierColor: "#6366f1" },
  { title: "Haiti's Climate Exodus", readers: 67, earned: "0.067", tier: "Early", tierColor: "#14b8a6" },
];

const TRANSACTIONS = [
  { from: "UQCc...C31", amount: "0.065", time: "2 min ago", article: "Water Crisis in Senegal" },
  { from: "EQBx...F4a", amount: "0.065", time: "14 min ago", article: "Water Crisis in Senegal" },
  { from: "UQDm...9Kp", amount: "0.046", time: "1 hr ago", article: "The $2 Billion Oil Theft" },
  { from: "EQAb...3Tz", amount: "0.065", time: "2 hr ago", article: "Water Crisis in Senegal" },
  { from: "UQFk...8Ws", amount: "0.046", time: "3 hr ago", article: "The $2 Billion Oil Theft" },
];

const maxAmount = Math.max(...EARNINGS.map(e => e.amount));

export default function DashboardPage() {
  const [wallet] = useState("UQCcURmeS49ENWeAq3H4j9T64L9G4OImlknTdLqXm1kgcC31");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", padding: "1.25rem 2rem", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, background: "#0a0f1eee", backdropFilter: "blur(10px)", zIndex: 10 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Press Protocol</span>
        </a>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
            {wallet.slice(0, 8)}...{wallet.slice(-6)}
          </div>
          <a href="/register" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>+ New Article</a>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Journalist Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Your earnings flow directly to your TON wallet in real time</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "2rem" }}>
          {[
            { label: "Total earned", value: "7.77 BSA USD", sub: "all time" },
            { label: "This month", value: "2.31 BSA USD", sub: "+25% vs last month" },
            { label: "Total readers", value: "2,806", sub: "across all articles" },
            { label: "Avg per reader", value: "0.065 BSA", sub: "USD per read" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.25rem" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#14b8a6", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: "1.5rem" }}>Monthly earnings (BSA USD)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
            {EARNINGS.map(e => (
              <div key={e.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>{e.amount.toFixed(2)}</div>
                <div style={{
                  width: "100%", background: "#14b8a6",
                  height: `${(e.amount / maxAmount) * 80}px`,
                  borderRadius: "4px 4px 0 0", opacity: e.month === "Mar" ? 1 : 0.5
                }} />
                <div style={{ fontSize: 12, color: "#64748b" }}>{e.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "2rem" }}>

          {/* Articles */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.25rem" }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: "1rem" }}>Your articles</div>
            {ARTICLES.map(a => (
              <div key={a.title} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "white", flex: 1, paddingRight: 8 }}>{a.title}</div>
                  <span style={{ background: a.tierColor + "22", color: a.tierColor, padding: "2px 8px", borderRadius: 20, fontSize: 11, flexShrink: 0 }}>{a.tier}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{a.readers.toLocaleString()} readers</span>
                  <span style={{ fontSize: 12, color: "#14b8a6", fontWeight: 600 }}>{a.earned} BSA USD</span>
                </div>
              </div>
            ))}
            <a href="/register" style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: 8, border: "1px dashed #1e293b", color: "#64748b", fontSize: 13, textDecoration: "none" }}>
              + Publish new article
            </a>
          </div>

          {/* Recent payments */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.25rem" }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: "1rem" }}>Recent payments</div>
            {TRANSACTIONS.map((tx, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1e293b" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{tx.from}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{tx.article} · {tx.time}</div>
                </div>
                <div style={{ fontSize: 13, color: "#14b8a6", fontWeight: 600 }}>+{tx.amount} BSA</div>
              </div>
            ))}
          </div>

        </div>

        {/* TON info */}
        <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 12, padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#14b8a6", marginBottom: 4 }}>Payments go directly to your TON wallet</div>
            <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{wallet}</div>
          </div>
          <a href="https://testnet.tonscan.org" target="_blank" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            View on TON Explorer →
          </a>
        </div>

      </div>
    </div>
  );
}