import { getAllArticles } from "../press/articles";

export const GET = async () => {
  const articles = getAllArticles();
  return Response.json({ articles });
};

