export type PriceTier = {
    amountAtomic: string;
    display: string;
    label: "Early" | "Growing" | "Established";
};

export function getPriceTier(readCount: number): PriceTier {
    if (readCount < 100) {
        return { amountAtomic: "10000000", display: "0.01 BSA USD", label: "Early" };
    }

    if (readCount < 1000) {
        return { amountAtomic: "50000000", display: "0.05 BSA USD", label: "Growing" };
    }

    return { amountAtomic: "100000000", display: "0.10 BSA USD", label: "Established" };
}
