import api from "./api";

// GET /search/users?q=&page=&limit= -> { success, pagination, users }
export const searchUsers = async (q, page = 1, limit = 10) => {
  const { data } = await api.get("/search/users", { params: { q, page, limit } });
  return data;
};

// GET /search/posts?q=&page=&limit= -> { success, pagination, posts }
export const searchPosts = async (q, page = 1, limit = 10) => {
  const { data } = await api.get("/search/posts", { params: { q, page, limit } });
  return data;
};

// GET /search/hashtags?q=&page=&limit= -> { success, pagination, hashtags }
export const searchHashtags = async (q, page = 1, limit = 10) => {
  const { data } = await api.get("/search/hashtags", { params: { q, page, limit } });
  return data;
};