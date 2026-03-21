export type SeedArticle = {
    id: string;
    slug: string;
    title: string;
    authorName: string;
    location: string;
    category: string;
    preview: string;
    content: string;
    readCount: number;
    contributors: Array<{
        id: string;
        name: string;
        wallet: string;
        role: "Journalist" | "Editor" | "Translator" | "Photographer" | "Protocol";
        percent: number;
        telegramHandle?: string;
    }>;
};

const PROTOCOL_CONTRIBUTOR = {
    id: "con_protocol",
    name: "Press Protocol",
    wallet: "UQCcURmeS49ENWeAq3H4j9T64L9G4OImlknTdLqXm1kgcC31",
    role: "Protocol" as const,
    percent: 5,
    telegramHandle: "presstonbot",
};

export const DEMO_ARTICLES: SeedArticle[] = [
    {
        id: "demo",
        slug: "water-crisis-in-senegal",
        title: "Water Crisis in Senegal: The Villages Being Left Behind",
        authorName: "Amara Diallo",
        location: "Thies, Senegal",
        category: "Investigative",
        preview:
            "In the rural outskirts of Thies, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.",
        content: `In the rural outskirts of Thies, Senegal, thousands of families walk up to 8 kilometers daily just to access clean water. Local authorities have repeatedly promised infrastructure that never arrives.

Amara Diallo spent three months embedded in the village of Keur Matar, documenting the daily reality of 47 families who share a single functioning well. The well, built by an NGO in 2009, was never maintained by local government and is now contaminated with agricultural runoff.

"My children have been sick every month this year," said Fatou Ndiaye, a mother of four. "We know the water is bad but we have no choice." Local health records show a 340% increase in waterborne illness cases since 2019 in the surrounding district.

The regional water authority declined multiple requests for comment. Three officials contacted by Press Protocol did not respond. Budget documents obtained through a freedom of information request show that $2.3 million allocated for rural water infrastructure in 2022 remains unspent.

This investigation was funded directly by readers who pre-paid for this story before a single word was written. No advertiser. No publisher. No editor telling Amara which stories are worth telling.`,
        readCount: 1847,
        contributors: [
            {
                id: "con_amara",
                name: "Amara Diallo",
                wallet: "UQA4_P8JQ8fD9Gv4dA7w2i9CFsn0k4sLG6GU3Pj8nReb3N3U",
                role: "Journalist",
                percent: 65,
                telegramHandle: "amaradiallo",
            },
            {
                id: "con_leila",
                name: "Leila Moreau",
                wallet: "UQAR3o6o8Jm1FKe5v9v9r7emQ4w8V5vR7gTQHZIBL9QW1E7A",
                role: "Editor",
                percent: 15,
            },
            {
                id: "con_nadia",
                name: "Nadia El-Tayeb",
                wallet: "UQAf9nR5mI4CkN6_a2wB3F-9hXVmz3W5rGfc6aN5sY0G2uGi",
                role: "Translator",
                percent: 10,
            },
            {
                id: "con_moussa",
                name: "Moussa Ndiaye",
                wallet: "UQC5_YM2gY4lH0b4VwL0wM2lOHE4nRXC6uEe9I7aW7fE4jcw",
                role: "Photographer",
                percent: 5,
            },
            PROTOCOL_CONTRIBUTOR,
        ],
    },
    {
        id: "nigeria",
        slug: "nigeria-oil-theft",
        title: "The $2 Billion Oil Theft: How Nigeria's Elites Drain the Delta",
        authorName: "Chidi Okonkwo",
        location: "Niger Delta, Nigeria",
        category: "Corruption",
        preview:
            "Every day, an estimated 200,000 barrels of crude oil disappear from Nigeria's Delta pipelines. The money vanishes into a network of shell companies, military officials, and international banks.",
        content: `Every day, an estimated 200,000 barrels of crude oil disappear from Nigeria's Delta pipelines. The money vanishes into a network of shell companies, military officials, and international banks.

Chidi Okonkwo spent eight months tracking payments across four continents, obtaining internal documents from three oil companies and interviewing dozens of sources, many of whom spoke only under condition of anonymity for fear of their lives.

The investigation reveals a system where local militia groups with ties to power brokers tap pipelines with military-grade equipment. The stolen oil is sold to illegal refineries or loaded onto tankers registered in offshore jurisdictions.

"We know who is doing this," said a senior official at the Nigerian National Petroleum Corporation who asked not to be named. "Everyone knows. But these people have protection at the highest levels."

The communities living above these pipelines see nothing. Ogoniland, where the theft is most concentrated, has one of the lowest per-capita incomes in Nigeria despite sitting on billions of dollars of oil reserves. Flared gas has made the air unbreathable. The creeks are black.`,
        readCount: 892,
        contributors: [
            {
                id: "con_chidi",
                name: "Chidi Okonkwo",
                wallet: "UQBA2DRLr0YfUup1J5Yw91R7qfE1dD3Yt6u8D7m9Jk2N6s0l",
                role: "Journalist",
                percent: 70,
                telegramHandle: "chidireports",
            },
            {
                id: "con_leila",
                name: "Leila Moreau",
                wallet: "UQAR3o6o8Jm1FKe5v9v9r7emQ4w8V5vR7gTQHZIBL9QW1E7A",
                role: "Editor",
                percent: 15,
            },
            {
                id: "con_nadia",
                name: "Nadia El-Tayeb",
                wallet: "UQAf9nR5mI4CkN6_a2wB3F-9hXVmz3W5rGfc6aN5sY0G2uGi",
                role: "Translator",
                percent: 10,
            },
            PROTOCOL_CONTRIBUTOR,
        ],
    },
    {
        id: "myanmar",
        slug: "inside-myanmar-digital-resistance",
        title: "Inside Myanmar's Digital Resistance: Journalists Who Risk Everything",
        authorName: "Thin Zar Hlaing",
        location: "Yangon, Myanmar",
        category: "Press Freedom",
        preview:
            "Since the 2021 military coup, 247 journalists have been arrested in Myanmar. Thin Zar Hlaing is one of the few still operating inside the country, filing reports via encrypted apps and moving safe houses every three days.",
        content: `Since the 2021 military coup, 247 journalists have been arrested in Myanmar. Thin Zar Hlaing is one of the few still operating inside the country, filing reports via encrypted apps and moving safe houses every three days.

"I cannot use my real name anywhere," she writes in a message sent through three layers of encryption. "My family does not know where I am. But the stories must be told."

The military junta has systematically dismantled Myanmar's independent media. Journalists caught can face decades in prison under laws now weaponized against anyone documenting regime abuses.

Yet a shadow press corps has emerged. Young reporters operate in cells of three or four. They share encrypted drives and use blockchain payments because bank accounts can be frozen with a single phone call to a minister.

Without them, mass arrests, forced disappearances, and the burning of villages would go unrecorded.`,
        readCount: 43,
        contributors: [
            {
                id: "con_thin_zar",
                name: "Thin Zar Hlaing",
                wallet: "UQCb8ju9y5zAeh7sGJ2m2b4YfL7gq8jM4x8Wg8zM1sP9d1u3",
                role: "Journalist",
                percent: 80,
            },
            {
                id: "con_nadia",
                name: "Nadia El-Tayeb",
                wallet: "UQAf9nR5mI4CkN6_a2wB3F-9hXVmz3W5rGfc6aN5sY0G2uGi",
                role: "Editor",
                percent: 10,
            },
            {
                ...PROTOCOL_CONTRIBUTOR,
                id: "con_protocol_myanmar",
                percent: 10,
            },
        ],
    },
];
