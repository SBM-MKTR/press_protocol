import { listPublishedArticles } from "../../../lib/repositories/articles";

export const GET = async () => {
  const articles = await listPublishedArticles();
  return Response.json({ articles });
};
