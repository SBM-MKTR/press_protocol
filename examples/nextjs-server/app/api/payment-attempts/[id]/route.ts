import { getPaymentAttemptById } from "../../../../lib/repositories/articles";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const paymentAttempt = await getPaymentAttemptById(id);

    if (!paymentAttempt) {
        return Response.json({ error: "Payment attempt not found" }, { status: 404 });
    }

    return Response.json({ paymentAttempt });
}
