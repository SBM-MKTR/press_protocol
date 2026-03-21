import {
    getPaymentAttemptById,
    markPaymentAttemptAsSubmitted,
} from "../../../../../lib/repositories/articles";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const existingAttempt = await getPaymentAttemptById(id);

    if (!existingAttempt) {
        return Response.json({ error: "Payment attempt not found" }, { status: 404 });
    }

    const payerWallet =
        typeof body?.payerWallet === "string" && body.payerWallet.trim().length > 0
            ? body.payerWallet.trim()
            : undefined;
    const txHash =
        typeof body?.txHash === "string" && body.txHash.trim().length > 0
            ? body.txHash.trim()
            : undefined;
    const queryId =
        typeof body?.queryId === "string" && body.queryId.trim().length > 0
            ? body.queryId.trim()
            : undefined;
    const paymentMethod =
        body?.paymentMethod === "x402" ? "x402" : "tonconnect";

    await markPaymentAttemptAsSubmitted(id, {
        payerWallet,
        txHash,
        queryId,
        paymentMethod,
    });

    const paymentAttempt = await getPaymentAttemptById(id);
    return Response.json({ paymentAttempt });
}
