"use client";
import { useParams } from "next/navigation";

const JOURNALISTS: Record<string, {
  name: string;
  location: string;
  bio: string;
  avatar: string;
  speciality: string[];
  joined: string;
  totalEarned: string;
  totalReaders: number;
  articles: { id: string; title: string; category: string; readCount: number; priceDisplay: string; preview: string }[];
  social?: { twitter?: string; telegram?: string };
}> = {
  "amara-diallo": {
    name: "Amara Diallo",
    location: "Thiès, Senegal",
    bio: "Amara Diallo is an investigative journalist based in Thiès, Senegal, specializing in water access, public health, and government accountability across West Africa. She has been reporting from underserved communities for over a decade, documenting the gap between government promises and lived reality. Her work has been cited by international NGOs and human rights organizations. Before Press Protocol, she had no reliable way to be paid for her reporting.",
    avatar: "AD",
    speciality: ["Water & Sanitation", "Public Health", "Government Accountability", "West Africa"],
    joined: "January 2026",
    totalEarned: "1.847 BSA USD",
    totalReaders: 1847,
    articles: [
      {
        id: "demo",
        title: "Water Crisis in Senegal: The Villages Being Left Behind",
        category: "Investigative",
        readCount: 1847,
        priceDisplay: "0.10 BSA USD",
        preview: "In the rural outskirts of Thiès, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water."
      }
    ],
    social: { telegram: "t.me/amaradiallo" }
  },
  "chidi-okonkwo": {
    name: "Chidi Okonkwo",
    location: "Niger Delta, Nigeria",
    bio: "Chidi Okonkwo is a Nigerian investigative journalist and environmental reporter covering oil corruption, corporate accountability, and the human cost of resource extraction in the Niger Delta. He has spent 15 years documenting oil spills, political corruption, and the communities left behind by Nigeria's oil wealth. He has been threatened, briefly detained, and had his equipment confiscated. He keeps reporting.",
    avatar: "CO",
    speciality: ["Oil & Corruption", "Environmental Justice", "Nigeria", "Corporate Accountability"],
    joined: "February 2026",
    totalEarned: "0.446 BSA USD",
    totalReaders: 892,
    articles: [
      {
        id: "nigeria",
        title: "The $2 Billion Oil Theft: How Nigeria's Elites Drain the Delta",
        category: "Corruption",
        readCount: 892,
        priceDisplay: "0.05 BSA USD",
        preview: "Every day, an estimated 200,000 barrels of crude oil disappear from Nigeria's Delta pipelines."
      }
    ],
    social: { telegram: "t.me/chidireports" }
  },
  "thin-zar-hlaing": {
    name: "Thin Zar Hlaing",
    location: "Yangon, Myanmar",
    bio: "Thin Zar Hlaing is one of a small number of journalists still operating inside Myanmar following the 2021 military coup. She files reports via encrypted apps, moves safe houses every three days, and has not used her real name publicly in three years. She documents military operations, civilian casualties, and the digital resistance movement that has emerged in the coup's aftermath. Press Protocol is the first system that has allowed her to receive payment without a bank account that could be frozen.",
    avatar: "TZ",
    speciality: ["Press Freedom", "Military Conflict", "Myanmar", "Digital Rights"],
    joined: "March 2026",
    totalEarned: "0.043 BSA USD",
    totalReaders: 43,
    articles: [
      {
        id: "myanmar",
        title: "Inside Myanmar's Digital Resistance: Journalists Who Risk Everything",
        category: "Press Freedom",
        readCount: 43,
        priceDisplay: "0.01 BSA USD",
        preview: "Since the 2021 military coup, 247 journalists have been arrested in Myanmar."
      }
    ],
    social: {}
  },
  "olena-kovalenko": {
    name: "Olena Kovalenko",
    location: "Kyiv, Ukraine",
    bio: "Olena Kovalenko is a Ukrainian investigative journalist specializing in financial accountability and reconstruction transparency. She has been reporting from Ukraine since 2014, covering the conflict, its economic consequences, and the international response. Her current investigation follows the $400 billion pledged for Ukraine's reconstruction — tracking where the money goes, where it disappears, and who is accountable. She has received three threats since beginning this investigation.",
    avatar: "OK",
    speciality: ["Financial Accountability", "Reconstruction", "Ukraine", "International Aid"],
    joined: "January 2026",
    totalEarned: "3.241 BSA USD",
    totalReaders: 3241,
    articles: [
      {
        id: "ukraine",
        title: "The Reconstruction Billions: Where is Ukraine's Money Going?",
        category: "Accountability",
        readCount: 3241,
        priceDisplay: "0.10 BSA USD",
        preview: "The international community has pledged over $400 billion to rebuild Ukraine."
      }
    ],
    social: { twitter: "@olenakovalenko", telegram: "t.me/olenareports" }
  },
  "marie-claire-desrosiers": {
    name: "Marie-Claire Desrosiers",
    location: "Artibonite, Haiti",
    bio: "Marie-Claire Desrosiers has been documenting Haiti's crises for a decade — earthquakes, hurricanes, political collapse, and now climate change. She is one of the few Haitian journalists with an international platform, writing in both French and English. She has never had a staff position at a publication. Before Press Protocol, her freelance fees sometimes took a year to arrive — when they arrived at all. She is now paid within seconds of her work being read.",
    avatar: "MC",
    speciality: ["Climate Justice", "Haiti", "Disaster Response", "International Aid"],
    joined: "February 2026",
    totalEarned: "0.067 BSA USD",
    totalReaders: 67,
    articles: [
      {
        id: "haiti",
        title: "Haiti's Climate Exodus: When the Land Itself Becomes the Enemy",
        category: "Climate",
        readCount: 67,
        priceDisplay: "0.05 BSA USD",
        preview: "In Haiti's Artibonite Valley, the floods come three times a year now, not once."
      }
    ],
    social: { twitter: "@mcdesrosiers" }
  }
};

export default function JournalistPage() {
  const params = useParams();
  const id = params.id as string;
  const journalist = JOURNALISTS[id];

  if (!journalist) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Journalist not found</h1>
          <a href="/feed" style={{ color: "#14b8a6" }}>Browse all stories</a>
        </div>
      </div>
    );
  }

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
          <a href="/press?id=demo" style={{ background: "#14b8a6", color: "#0a0f1e", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Read Now</a>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Profile header */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <div style={{ width: 72, height: 72, background: "#14b8a622", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#14b8a6", flexShrink: 0 }}>
              {journalist.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{journalist.name}</h1>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 10 }}>{journalist.location} · Joined {journalist.joined}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {journalist.speciality.map(s => (
                  <span key={s} style={{ background: "#14b8a622", color: "#14b8a6", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: "1.5rem" }}>{journalist.bio}</p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Total earned", value: journalist.totalEarned },
              { label: "Total readers", value: journalist.totalReaders.toLocaleString() },
              { label: "Articles published", value: journalist.articles.length.toString() },
            ].map(s => (
              <div key={s.label} style={{ background: "#0a0f1e", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#14b8a6", marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1rem" }}>Published stories</h2>
          {journalist.articles.map(article => (
            <a key={article.id} href={`/press?id=${article.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.25rem", marginBottom: 12, cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{article.category}</span>
                  <span style={{ background: "#1e293b", color: "#64748b", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>{article.readCount.toLocaleString()} readers</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 8 }}>{article.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 12 }}>{article.preview}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>Pay to read</span>
                  <span style={{ fontSize: 14, color: "#14b8a6", fontWeight: 700 }}>{article.priceDisplay}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Support */}
        <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 16, padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Support {journalist.name.split(" ")[0]}'s reporting</h3>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: "1.5rem", lineHeight: 1.7 }}>Every article you read pays {journalist.name.split(" ")[0]} directly in BSA USD — instantly, on the TON blockchain, with no middleman.</p>
          <a href={`/press?id=${journalist.articles[0]?.id ?? "demo"}`} style={{ background: "#14b8a6", color: "#0a0f1e", padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Read & support now
          </a>
        </div>

      </div>
    </div>
  );
}
