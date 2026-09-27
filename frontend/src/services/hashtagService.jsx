import api from "./api";

// GET /hashtags/:name -> { success, hashtag: { id, name, postCount } }
export const fetchHashtag = async (name) => {
  const { data } = await api.get(`/hashtags/${encodeURIComponent(name)}`);
  return data;
};

// GET /hashtags/:name/posts?page=&limit= -> { success, hashtag, pagination, posts }
export const fetchHashtagPosts = async (name, page = 1, limit = 10) => {
  const { data } = await api.get(`/hashtags/${encodeURIComponent(name)}/posts`, {
    params: { page, limit },
  });
  return data;
};

// GET /hashtags/trending?limit= -> { success, hashtags }
export const fetchTrendingHashtags = async (limit = 10) => {
  const { data } = await api.get("/hashtags/trending", { params: { limit } });
  return data;
};