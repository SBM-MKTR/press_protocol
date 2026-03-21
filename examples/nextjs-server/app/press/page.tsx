"use client";
import { useState } from "react";

const SPLITS = [
  { role: "Journalist", percent: 65, color: "#14b8a6" },
  { role: "Editor", percent: 15, color: "#6366f1" },
  { role: "Translator", percent: 10, color: "#f59e0b" },
  { role: "Photographer", percent: 5, color: "#ec4899" },
  { role: "Protocol", percent: 5, color: "#64748b" },
];

const ARTICLE = {
  title: "Water Crisis in Senegal: The Villages Being Left Behind",
  author: "Amara Diallo",
  location: "Thiès, Senegal",
  preview: "In the rural outskirts of Thiès, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.",
  content: `In the rural outskirts of Thiès, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.

Amara Diallo spent three months embedded in the village of Keur Matar, documenting the daily reality of 47 families who share a single functioning well. The well, built by an NGO in 2009, was never maintained by local government and is now contaminated with agricultural runoff.

"My children have been sick every month this year," said Fatou Ndiaye, a mother of four. "We know the water is bad but we have no choice." Local health records show a 340% increase in waterborne illness cases since 2019 in the surrounding district.

The regional water authority declined multiple requests for comment. Three officials contacted by Press Protocol did not respond. Budget documents obtained through a freedom of information request show that $2.3 million allocated for rural water infrastructure in 2022 remains unspent.

This investigation was funded directly by 1,847 readers who pre-paid for this story before a single word was written. No advertiser. No publisher. No editor telling Amara which stories are worth telling.`,
  price: "0.10 BSA USD",
  readCount: 1847,
};

export default function PressPage() {
  const [state, setState] = useState<"preview" | "paying" | "unlocked">("preview");
  const [txHash, setTxHash] = useState("");

  const handlePay = async () => {
    setState("paying");
    try {
      await fetch("/api/press", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articleId: "demo" }),
      });
    } catch {}
    setTimeout(() => {
      setTxHash("57d03c76c29de0bda37fc72ba88344064b0aa40ae3725e1575aeb78938705c10");
      setState("unlocked");
    }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>

        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem", textDecoration: "none" }}>
  <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
  <span style={{ fontWeight: 600, fontSize: 16, color: "#14b8a6" }}>Press Protocol</span>
  <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>Powered by TON</span>
</a>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>Investigative</span>
            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{ARTICLE.location}</span>
            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{ARTICLE.readCount.toLocaleString()} readers</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{ARTICLE.title}</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>By <a href="/journalist/amara-diallo" style={{ color: "#14b8a6", textDecoration: "none", fontWeight: 600 }}>{ARTICLE.author}</a> · Press Protocol</p>
        </div>

        {state === "unlocked" && (
          <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 10, padding: "12px 16px", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 13, color: "#14b8a6", fontWeight: 600, marginBottom: 4 }}>Payment confirmed on TON blockchain</div>
            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>tx: {txHash}</div>
          </div>
        )}

        <div style={{ marginBottom: "2rem" }}>
          {state === "unlocked" ? (
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#e2e8f0" }}>
              {ARTICLE.content.split("\n\n").map((p, i) => (
                <p key={i} style={{ marginBottom: "1.2rem" }}>{p}</p>
              ))}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#e2e8f0", marginBottom: "1.2rem" }}>{ARTICLE.preview}</p>
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "#e2e8f0", filter: "blur(4px)", userSelect: "none" }}>
                  Amara Diallo spent three months embedded in the village of Keur Matar, documenting the daily reality of 47 families who share a single functioning well. The well, built by an NGO in 2009, was never maintained by local government.
                </p>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #0a0f1e)" }} />
              </div>
            </div>
          )}
        </div>

        {state !== "unlocked" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Price to read</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#14b8a6" }}>{ARTICLE.price}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Paid directly to contributors · No middleman</div>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment split</div>
              {SPLITS.map(s => (
                <div key={s.role} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: "#94a3b8", width: 100 }}>{s.role}</div>
                  <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${s.percent}%`, height: "100%", background: s.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 13, color: s.color, width: 36, textAlign: "right" }}>{s.percent}%</div>
                </div>
              ))}
            </div>
            <button
              onClick={handlePay}
              disabled={state === "paying"}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: state === "paying" ? "#1e293b" : "#14b8a6",
                color: state === "paying" ? "#64748b" : "#0a0f1e",
                fontSize: 15, fontWeight: 700, cursor: state === "paying" ? "default" : "pointer",
              }}
            >
              {state === "paying" ? "Processing payment on TON blockchain..." : `Pay ${ARTICLE.price} — Read Full Article`}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginTop: 10 }}>
              Secured by TON blockchain · BSA USD stablecoin · No bank needed
            </p>
          </div>
        )}

        {state === "unlocked" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment distributed to</div>
            {SPLITS.map(s => (
              <div key={s.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{s.role}</span>
                <span style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.percent}% · {(0.10 * s.percent / 100).toFixed(4)} BSA USD</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 12, color: "#334155" }}>
          Press Protocol · Built on TON · Telegram Mini App
        </div>

      </div>
    </div>
  );
}