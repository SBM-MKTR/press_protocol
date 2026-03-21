"use client";

import { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { beginCell, Address } from "@ton/core";

const SPLITS = [
  { role: "Journalist", percent: 65, color: "#14b8a6" },
  { role: "Editor", percent: 15, color: "#6366f1" },
  { role: "Translator", percent: 10, color: "#f59e0b" },
  { role: "Photographer", percent: 5, color: "#ec4899" },
  { role: "Protocol", percent: 5, color: "#64748b" },
];

const ARTICLE_META = {
  title: "Water Crisis in Senegal: The Villages Being Left Behind",
  author: "Amara Diallo",
  authorId: "amara-diallo",
  location: "Thiès, Senegal",
  preview:
    "In the rural outskirts of Thiès, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.",
};

type PageState = "preview" | "paying" | "unlocked" | "error";

interface PaymentInfo {
  queryId: string;
  amount: string;
  priceDisplay: string;
  payTo: string;
  jettonMaster: string;
  comment: string;
  network: string;
}

export default function PressPage() {
  const [state, setState] = useState<PageState>("preview");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [articleSplits, setArticleSplits] = useState<{ role: string; percent: number }[]>(SPLITS);
  const [priceDisplay, setPriceDisplay] = useState("0.10 BSA USD");
  const [readCount, setReadCount] = useState(1847);

  const [tonConnectUI] = useTonConnectUI();
  // useTonAddress(false) returns the raw address format usable by Address.parse()
  const rawAddress = useTonAddress(false);
  const isConnected = !!rawAddress;

  // Fetch real price from server on mount
  useEffect(() => {
    fetch("/api/press/info?articleId=demo")
      .then((r) => r.json())
      .then((info: PaymentInfo) => {
        if (info.priceDisplay) setPriceDisplay(info.priceDisplay);
      })
      .catch(() => {/* keep default */});
  }, []);

  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };

  const handlePay = async () => {
    if (!isConnected) {
      tonConnectUI.openModal();
      return;
    }

    setState("paying");
    setErrorMsg("");

    try {
      // 1. Get payment requirements from server (generates a fresh queryId)
      const infoRes = await fetch("/api/press/info?articleId=demo");
      if (!infoRes.ok) throw new Error("Failed to fetch payment info from server");
      const info: PaymentInfo = await infoRes.json();

      // 2. Resolve the sender's BSA USD jetton wallet address
      //    (the Jetton transfer goes to the sender's jetton wallet, not to the recipient directly)
      const jwRes = await fetch(`/api/press/jetton-wallet?owner=${encodeURIComponent(rawAddress)}`);
      if (!jwRes.ok) {
        const err = await jwRes.json();
        throw new Error(err.error ?? "Failed to resolve BSA USD wallet address");
      }
      const { walletAddress: senderJettonWallet } = await jwRes.json();

      // 3. Build TEP-74 Jetton transfer payload
      //    This is the standard TON Jetton transfer message body.
      //    The comment "x402:<queryId>" is how the server correlates this tx to the payment.
      const jettonTransferBody = beginCell()
        .storeUint(0xf8a7ea5, 32)                   // op::transfer (TEP-74)
        .storeUint(BigInt(info.queryId), 64)          // query_id
        .storeCoins(BigInt(info.amount))              // jetton amount to transfer
        .storeAddress(Address.parse(info.payTo))      // destination (article payment address)
        .storeAddress(Address.parse(rawAddress))      // response_destination (excess gas back to sender)
        .storeMaybeRef(null)                          // no custom_payload
        .storeCoins(1_000_000n)                       // forward_ton_amount (0.001 TON for notification)
        .storeBit(0)                                  // forward_payload: in-place
        .storeUint(0, 32)                             // text comment prefix
        .storeStringTail(info.comment)                // "x402:<queryId>"
        .endCell();

      // 4. Send via TonConnect — wallet app signs, broadcasts, and returns the BOC
      //    0.07 TON is attached as gas for the Jetton transfer operation
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: senderJettonWallet,
            amount: "70000000", // 0.07 TON for gas
            payload: jettonTransferBody.toBoc().toString("base64"),
          },
        ],
      });

      // result.boc is the signed external message — we pass it to the server
      // so the facilitator can match it against the on-chain transaction.

      // 5. Confirm payment on-chain via server (server polls TON, returns article on success)
      const unlockRes = await fetch("/api/press/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: "demo",
          fromAddress: rawAddress,
          queryId: info.queryId,
          boc: result.boc,
        }),
      });

      if (!unlockRes.ok) {
        const err = await unlockRes.json();
        throw new Error(err.error ?? "Payment confirmation failed");
      }

      const data = await unlockRes.json();
      setTxHash(data.txHash ?? "");
      setArticleContent(data.content ?? null);
      setReadCount(data.readCount ?? readCount + 1);
      if (data.splits?.length) setArticleSplits(data.splits);
      setState("unlocked");
    } catch (err) {
      const msg = (err as Error).message;
      // User rejected in wallet — don't treat as error
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("user declined")) {
        setState("preview");
        return;
      }
      setErrorMsg(msg);
      setState("error");
    }
  };

  const handleRetry = () => {
    setState("preview");
    setErrorMsg("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
            <span style={{ fontWeight: 600, fontSize: 16, color: "#14b8a6" }}>Press Protocol</span>
          </a>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {isConnected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 20, padding: "4px 12px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#14b8a6" }} />
                <span style={{ fontSize: 12, color: "#14b8a6" }}>
                  {rawAddress.slice(0, 4)}…{rawAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer" }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Article meta */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>Investigative</span>
            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{ARTICLE_META.location}</span>
            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{readCount.toLocaleString()} readers</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{ARTICLE_META.title}</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            By <a href={`/journalist/${ARTICLE_META.authorId}`} style={{ color: "#14b8a6", textDecoration: "none", fontWeight: 600 }}>{ARTICLE_META.author}</a> · Press Protocol
          </p>
        </div>

        {/* Payment confirmed banner */}
        {state === "unlocked" && txHash && (
          <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 10, padding: "12px 16px", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 13, color: "#14b8a6", fontWeight: 600, marginBottom: 4 }}>Payment confirmed on TON blockchain</div>
            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", wordBreak: "break-all" }}>tx: {txHash}</div>
          </div>
        )}

        {/* Error banner */}
        {state === "error" && (
          <div style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 10, padding: "12px 16px", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 4 }}>Payment failed</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{errorMsg}</div>
            <button onClick={handleRetry} style={{ background: "transparent", border: "1px solid #ef444455", color: "#ef4444", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>Try again</button>
          </div>
        )}

        {/* Article content */}
        <div style={{ marginBottom: "2rem" }}>
          {state === "unlocked" ? (
            <div style={{ fontSize: 15, lineHeight: 1.8, color: "#e2e8f0" }}>
              {(articleContent ?? "").split("\n\n").map((p, i) => (
                <p key={i} style={{ marginBottom: "1.2rem" }}>{p}</p>
              ))}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#e2e8f0", marginBottom: "1.2rem" }}>{ARTICLE_META.preview}</p>
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "#e2e8f0", filter: "blur(4px)", userSelect: "none" }}>
                  Amara Diallo spent three months embedded in the village of Keur Matar, documenting the daily reality of 47 families who share a single functioning well. The well, built by an NGO in 2009, was never maintained by local government.
                </p>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #0a0f1e)" }} />
              </div>
            </div>
          )}
        </div>

        {/* Payment card */}
        {state !== "unlocked" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Price to read</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#14b8a6" }}>{priceDisplay}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Paid directly to contributors via x402 on TON</div>
            </div>

            {/* Split bars */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment split</div>
              {SPLITS.map((s) => (
                <div key={s.role} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: "#94a3b8", width: 100 }}>{s.role}</div>
                  <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${s.percent}%`, height: "100%", background: s.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 13, color: s.color, width: 36, textAlign: "right" }}>{s.percent}%</div>
                </div>
              ))}
              <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
                Note: splits shown are distribution targets. Atomic multi-party settlement is in development.
              </p>
            </div>

            {/* CTA */}
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "#1d4ed8", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                Connect TON Wallet to Read
              </button>
            ) : (
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
                {state === "paying"
                  ? "Confirming on TON blockchain…"
                  : `Pay ${priceDisplay} — Read Full Article`}
              </button>
            )}

            <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginTop: 10 }}>
              {state === "paying"
                ? "Polling TON testnet for confirmation — this takes 5–30 seconds"
                : "Powered by BSA USD stablecoin · x402 protocol on TON · testnet"}
            </p>
          </div>
        )}

        {/* Post-payment split breakdown */}
        {state === "unlocked" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment distributed to</div>
            {articleSplits.map((s, i) => {
              const color = SPLITS[i]?.color ?? "#94a3b8";
              const amountNum = (0.10 * s.percent) / 100;
              return (
                <div key={s.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{s.role}</span>
                  <span style={{ fontSize: 13, color, fontWeight: 600 }}>
                    {s.percent}% · {amountNum.toFixed(4)} BSA USD
                  </span>
                </div>
              );
            })}
            <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
              Payment went to the single publisher address. Per-contributor routing is a planned next step.
            </p>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 12, color: "#334155" }}>
          Press Protocol · x402 on TON · Telegram Mini App ready
        </div>

      </div>
    </div>
  );
}
