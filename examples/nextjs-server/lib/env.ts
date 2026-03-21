export type ServerEnv = {
    databaseUrl: string;
    tonNetwork: "testnet" | "mainnet";
    paymentAddress?: string;
    jettonMasterAddress?: string;
    facilitatorUrl?: string;
    tonRpcUrl?: string;
    rpcApiKey?: string;
};

function readEnv(name: string): string | undefined {
    const value = process.env[name];
    if (!value) return undefined;

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export function getServerEnv(): ServerEnv {
    const databaseUrl = readEnv("DATABASE_URL");
    if (!databaseUrl) {
        throw new Error("Missing DATABASE_URL env variable");
    }

    const tonNetwork = readEnv("TON_NETWORK") === "mainnet" ? "mainnet" : "testnet";

    return {
        databaseUrl,
        tonNetwork,
        paymentAddress: readEnv("PAYMENT_ADDRESS"),
        jettonMasterAddress: readEnv("JETTON_MASTER_ADDRESS"),
        facilitatorUrl: readEnv("FACILITATOR_URL"),
        tonRpcUrl: readEnv("TON_RPC_URL"),
        rpcApiKey: readEnv("RPC_API_KEY"),
    };
}
