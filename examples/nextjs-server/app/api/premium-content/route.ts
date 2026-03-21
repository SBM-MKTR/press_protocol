import { paymentGate } from "@ton-x402/middleware";
import { getPaymentConfig } from "../../../lib/payment-config";

const handler = async () => {
    return Response.json({
        success: true,
        content: "This is premium content only accessible after paying a stablecoin micropayment.",
        secretCode: "JETTONS-ARE-AWESOME-" + Math.random().toString(36).substring(7),
    });
};

export async function GET(request: Request) {
    const gatedHandler = paymentGate(handler, {
        config: getPaymentConfig({
            amount: "10000000",
            asset: process.env.JETTON_MASTER_ADDRESS || "kQCd6G7c_HUBkgwtmGzpdqvHIQoNkYOEE0kSWoc5v57hPPnW",
            description: "Premium Content Access (0.01 BSA USD)",
            decimals: 9,
        }),
    });

    return gatedHandler(request);
}
