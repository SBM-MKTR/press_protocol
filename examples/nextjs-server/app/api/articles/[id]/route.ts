import { getArticleForClient } from "../../../../lib/repositories/articles";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const article = await getArticleForClient(id);

    if (!article) {
        return Response.json({ error: "Article not found" }, { status: 404 });
    }

    return Response.json({ article });
}
