export const ARTICLES: Record<string, {
  title: string;
  author: string;
  location: string;
  category: string;
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
    location: "Thiès, Senegal",
    category: "Investigative",
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
  },

  "nigeria": {
    title: "The $2 Billion Oil Theft: How Nigeria's Elites Drain the Delta",
    author: "Chidi Okonkwo",
    location: "Niger Delta, Nigeria",
    category: "Corruption",
    preview: "Every day, an estimated 200,000 barrels of crude oil disappear from Nigeria's Delta pipelines. The money — over $2 billion annually — vanishes into a network of shell companies, military officials, and international banks.",
    content: `Every day, an estimated 200,000 barrels of crude oil disappear from Nigeria's Delta pipelines. The money — over $2 billion annually — vanishes into a network of shell companies, military officials, and international banks.

Chidi Okonkwo spent eight months tracking payments across four continents, obtaining internal documents from three oil companies and interviewing 34 sources, many of whom spoke only under condition of anonymity for fear of their lives.

The investigation reveals a system where local militia groups — many with direct ties to state governors — tap pipelines with military-grade equipment. The stolen oil is sold to illegal refineries or loaded onto tankers registered in Malta, Cyprus, and the Marshall Islands.

"We know who is doing this," said a senior official at the Nigerian National Petroleum Corporation who asked not to be named. "Everyone knows. But these people have protection at the highest levels."

Bank records obtained by Press Protocol show payments flowing through accounts in Dubai, London, and Singapore before being converted into real estate in Lagos's Victoria Island — some of the most expensive property in Africa.

The communities living above these pipelines see nothing. Ogoniland, where the theft is most concentrated, has one of the lowest per-capita incomes in Nigeria despite sitting on billions of dollars of oil reserves. Flared gas has made the air unbreathable. The creeks are black.

This report was made possible by 892 readers who funded Chidi's investigation before it was written.`,
    price: "50000000",
    priceDisplay: "0.05 BSA USD",
    readCount: 892,
    splits: [
      { role: "Journalist", percent: 70 },
      { role: "Editor", percent: 15 },
      { role: "Translator", percent: 10 },
      { role: "Protocol", percent: 5 },
    ]
  },

  "myanmar": {
    title: "Inside Myanmar's Digital Resistance: Journalists Who Risk Everything",
    author: "Thin Zar Hlaing",
    location: "Yangon, Myanmar",
    category: "Press Freedom",
    preview: "Since the 2021 military coup, 247 journalists have been arrested in Myanmar. Thin Zar Hlaing is one of the few still operating inside the country — filing reports via encrypted apps, moving safe houses every three days.",
    content: `Since the 2021 military coup, 247 journalists have been arrested in Myanmar. Thin Zar Hlaing is one of the few still operating inside the country — filing reports via encrypted apps, moving safe houses every three days.

"I cannot use my real name anywhere," she writes in a message sent through three layers of encryption. "My family does not know where I am. But the stories must be told."

The military junta has systematically dismantled Myanmar's independent media. Eleven news outlets have been shuttered. Journalists caught can face 20 years under the country's colonial-era sedition laws, now weaponized against anyone documenting the regime's atrocities.

Yet a shadow press corps has emerged. Young reporters, many trained in the past five years, operate in cells of three or four. They share encrypted drives, use blockchain payments to receive funding — because bank accounts can be frozen with a single phone call to a minister.

Press Protocol is one of the tools they use. "When someone in Germany pays to read my story, the money arrives in my TON wallet in seconds," Thin Zar explains. "No bank. No name. No way for them to stop it."

The stories these journalists file document mass graves, forced disappearances, and the systematic burning of villages in Sagaing Region. Without them, these events would go unrecorded.

Thin Zar's identity has been protected in this report. Her byline is a pseudonym.`,
    price: "10000000",
    priceDisplay: "0.01 BSA USD",
    readCount: 43,
    splits: [
      { role: "Journalist", percent: 80 },
      { role: "Editor", percent: 10 },
      { role: "Protocol", percent: 10 },
    ]
  },

  "ukraine": {
    title: "The Reconstruction Billions: Where is Ukraine's Money Going?",
    author: "Olena Kovalenko",
    location: "Kyiv, Ukraine",
    category: "Accountability",
    preview: "The international community has pledged over $400 billion to rebuild Ukraine. Olena Kovalenko has spent six months following the money — and what she found should alarm every donor government.",
    content: `The international community has pledged over $400 billion to rebuild Ukraine. Olena Kovalenko has spent six months following the money — and what she found should alarm every donor government.

Reconstruction contracts worth billions are being awarded without competitive tender. Companies with no construction experience are winning government contracts. Some exist only on paper — registered weeks before receiving public funds.

"This is the largest reconstruction effort since the Marshall Plan," said one Western diplomat who spoke on background. "And the oversight mechanisms are completely inadequate."

Kovalenko obtained procurement records through Ukraine's Prozorro transparency system and cross-referenced them with corporate registries in Cyprus, the UK, and Delaware — common destinations for Ukrainian shell companies.

One contract for road reconstruction in Kharkiv Oblast — worth $340 million — was awarded to a company registered three months earlier. Its listed address is a residential apartment in Kyiv. Its director has no prior construction experience.

Ukrainian officials deny wrongdoing. The anti-corruption bureau, NABU, says it is investigating 14 procurement cases but has made no arrests.

Meanwhile, in liberated villages across Kherson and Mykolaiv Oblasts, families live in damaged homes through another winter. The money meant to rebuild their houses exists — on paper — in the accounts of companies that may never swing a hammer.

Olena Kovalenko remains in Kyiv. She receives no salary from any publication. This story was funded entirely by her readers on Press Protocol.`,
    price: "100000000",
    priceDisplay: "0.10 BSA USD",
    readCount: 3241,
    splits: [
      { role: "Journalist", percent: 65 },
      { role: "Editor", percent: 15 },
      { role: "Translator", percent: 10 },
      { role: "Photographer", percent: 5 },
      { role: "Protocol", percent: 5 },
    ]
  },

  "haiti": {
    title: "Haiti's Climate Exodus: When the Land Itself Becomes the Enemy",
    author: "Marie-Claire Desrosiers",
    location: "Artibonite, Haiti",
    category: "Climate",
    preview: "In Haiti's Artibonite Valley, the floods come three times a year now, not once. Farmers who fed the country for generations are leaving. Climate change is finishing what the earthquake started.",
    content: `In Haiti's Artibonite Valley, the floods come three times a year now, not once. Farmers who fed the country for generations are leaving. Climate change is finishing what the earthquake started.

Marie-Claire Desrosiers grew up in Artibonite. She returned after ten years abroad to find her family's rice farm underwater for the fourth time in eighteen months. She stayed to document what is happening.

The Artibonite River, Haiti's longest, now floods with a regularity that makes farming impossible. Deforestation — accelerated by charcoal production, the only energy source most Haitians can afford — has stripped the hillsides of everything that once held water back.

"My grandfather farmed this land. My father farmed this land. I cannot farm this land," said Jean-Baptiste Pierre, 34, standing in knee-deep water that covered what were once rice paddies. "And there is nowhere to go."

Haiti contributes less than 0.1% of global greenhouse gas emissions. It ranks among the ten countries most vulnerable to climate change. The cruel arithmetic is not lost on those leaving.

Port-au-Prince, already unable to absorb the population it has, receives 200,000 new internal migrants every year. They arrive to gang-controlled neighborhoods, no sanitation, no jobs, no future — climate refugees in their own country.

International climate funds have pledged hundreds of millions to Haiti. Less than 12% has been disbursed. The rest sits in bureaucratic limbo in Washington, Paris, and Geneva.

Marie-Claire wrote this story with no editor, no publisher, and no salary. She is funded by readers who believe her work matters.`,
    price: "10000000",
    priceDisplay: "0.01 BSA USD",
    readCount: 67,
    splits: [
      { role: "Journalist", percent: 75 },
      { role: "Photographer", percent: 15 },
      { role: "Protocol", percent: 10 },
    ]
  }
};

export function getPrice(articleId: string): string {
  const article = ARTICLES[articleId];
  if (!article) return "50000000";
  const count = article.readCount;
  if (count < 100) return "10000000";
  if (count < 1000) return "50000000";
  return "100000000";
}

export function getPriceDisplay(articleId: string): string {
  const count = ARTICLES[articleId]?.readCount ?? 0;
  if (count < 100) return "0.01 BSA USD";
  if (count < 1000) return "0.05 BSA USD";
  return "0.10 BSA USD";
}
export function getAllArticles() {
  return Object.entries(ARTICLES).map(([id, article]) => ({
    id,
    title: article.title,
    author: article.author,
    location: article.location,
    category: article.category,
    preview: article.preview,
    priceDisplay: article.priceDisplay,
    currentPrice: getPrice(id),
    readCount: article.readCount,
    splits: article.splits,
  }));
}
