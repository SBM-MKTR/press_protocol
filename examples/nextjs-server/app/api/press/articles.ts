export const ARTICLES: Record<string, {
  title: string;
  author: string;
  preview: string;
  content: string;
  price: string;
  priceDisplay: string;
  readCount: number;
  splits: { role: string; percent: number }[];
}> = {
  "demo": {
    title: "Water Crisis in Senegal: The Villages Being Left Behind",
    author: "Amara Diallo",
    preview: "In the rural outskirts of Thiès, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.",
    content: `In the rural outskirts of Thiès, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.

Amara Diallo spent three months embedded in the village of Keur Matar, documenting the daily reality of 47 families who share a single functioning well. The well, built by an NGO in 2009, was never maintained by local government and is now contaminated with agricultural runoff.

"My children have been sick every month this year," said Fatou Ndiaye, a mother of four. "We know the water is bad but we have no choice." Local health records show a 340% increase in waterborne illness cases since 2019 in the surrounding district.

The regional water authority declined multiple requests for comment. Three officials contacted by Press Protocol did not respond. Budget documents obtained through a freedom of information request show that $2.3 million allocated for rural water infrastructure in 2022 remains unspent.

This investigation was funded directly by 1,847 readers who pre-paid for this story before a single word was written. No advertiser. No publisher. No editor telling Amara which stories are worth telling.`,
    price: "50000000",
    priceDisplay: "0.05 BSA USD",
    readCount: 1847,
    splits: [
      { role: "Journalist", percent: 65 },
      { role: "Editor", percent: 15 },
      { role: "Translator", percent: 10 },
      { role: "Photographer", percent: 5 },
      { role: "Protocol", percent: 5 },
    ]
  }
};

export function getPrice(articleId: string): string {
  const article = ARTICLES[articleId];
  if (!article) return "50000000";
  const count = article.readCount;
  if (count < 100) return "10000000";   // 0.01 BSA USD — early supporters
  if (count < 1000) return "50000000";  // 0.05 BSA USD — growing
  return "100000000";                    // 0.10 BSA USD — established
}