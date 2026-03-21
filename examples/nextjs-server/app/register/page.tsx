"use client";
import { useState } from "react";

const SPLITS = [
  { role: "Journalist", percent: 65, color: "#14b8a6" },
  { role: "Editor", percent: 15, color: "#6366f1" },
  { role: "Translator", percent: 10, color: "#f59e0b" },
  { role: "Photographer", percent: 5, color: "#ec4899" },
  { role: "Protocol", percent: 5, color: "#64748b" },
];

export default function RegisterPage() {
  const [state, setState] = useState<"form" | "success">("form");
  const [form, setForm] = useState({
    title: "",
    content: "",
    wallet: "",
    price: "0.05",
    editor: "",
    translator: "",
    photographer: "",
  });

  const handlePublish = () => {
    if (!form.title || !form.content || !form.wallet) return;
    setState("success");
  };

  const generatedLink = "https://press-protocol-chi.vercel.app/press?id=a7f3k2";

  if (state === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
            <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
            <span style={{ fontWeight: 600, fontSize: 16, color: "#14b8a6" }}>Press Protocol</span>
          </div>

          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ width: 64, height: 64, background: "#14b8a622", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28 }}>✓</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Your article is live</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Share this link in your Telegram channel to start earning</p>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Your Press Protocol link</div>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#14b8a6", wordBreak: "break-all", marginBottom: 12 }}>{generatedLink}</div>
            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #14b8a6", background: "transparent", color: "#14b8a6", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Copy link
            </button>
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment split</div>
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

          <p style={{ textAlign: "center", fontSize: 12, color: "#475569" }}>
            Payments arrive in your TON wallet within seconds of each reader paying. No invoices. No waiting. No bank needed.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
          <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
          <span style={{ fontWeight: 600, fontSize: 16, color: "#14b8a6" }}>Press Protocol</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>Powered by TON</span>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>Publish your story.<br />Get paid instantly.</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7 }}>Your readers pay you directly in BSA USD stablecoin. Payments split automatically to every contributor in one TON transaction. No bank. No middleman. No platform taking a cut.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Article title</label>
            <input
              type="text"
              placeholder="Your article title..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a", color: "white", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Article content</label>
            <textarea
              placeholder="Write your article here..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a", color: "white", fontSize: 14, minHeight: 200, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Your TON wallet — receives payments directly</label>
            <input
              type="text"
              placeholder="EQB..."
              value={form.wallet}
              onChange={e => setForm({ ...form, wallet: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a", color: "white", fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 6 }}>Price per read (BSA USD)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              step="0.01"
              min="0.01"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0f172a", color: "white", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 12 }}>Split payments with collaborators (optional)</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Editor TON wallet</label>
                <input type="text" placeholder="EQB..." value={form.editor} onChange={e => setForm({ ...form, editor: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0a0f1e", color: "white", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Translator TON wallet</label>
                <input type="text" placeholder="EQB..." value={form.translator} onChange={e => setForm({ ...form, translator: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0a0f1e", color: "white", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Photographer TON wallet</label>
                <input type="text" placeholder="EQB..." value={form.photographer} onChange={e => setForm({ ...form, photographer: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #1e293b", background: "#0a0f1e", color: "white", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          <button
            onClick={handlePublish}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "#14b8a6", color: "#0a0f1e", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
          >
            Publish to Press Protocol
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#475569" }}>
            Secured by TON blockchain · Payments in BSA USD stablecoin · No bank needed
          </p>

        </div>
      </div>
    </div>
  );
}