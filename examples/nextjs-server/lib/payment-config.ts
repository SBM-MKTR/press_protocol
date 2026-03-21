import type { PaymentConfig } from "@ton-x402/core";
import { getPaymentRuntimeEnv } from "./env";

export function getPaymentConfig(
    overrides?: Partial<PaymentConfig>,
): PaymentConfig {
    const env = getPaymentRuntimeEnv();
    const payTo = overrides?.payTo ?? env.paymentAddress;
    if (!payTo) {
        throw new Error("Missing PAYMENT_ADDRESS env variable — set it to your TON wallet address");
    }

    return {
        amount: overrides?.amount ?? "100000000", // 0.1 TON default
        asset: overrides?.asset ?? "TON",
        payTo,
        network: overrides?.network ?? env.tonNetwork,
        facilitatorUrl:
            overrides?.facilitatorUrl ??
            env.facilitatorUrl ??
            "http://localhost:3000/api/facilitator",
        description: overrides?.description,
        decimals: overrides?.decimals,
    };
}
