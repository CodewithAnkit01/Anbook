import api from "./api";

// GET /feed -> { success, pagination: { page, limit, total, totalPages, hasNextPage }, posts }
export const fetchFeed = async (page = 1, limit = 10) => {
  const { data } = await api.get("/feed", { params: { page, limit } });
  return data;
};

// POST /post (multipart/form-data) -> { success, message, post }
export const createPost = async (formData, onProgress) => {
  const { data } = await api.post("/post", formData, {
    // api.js defaults to JSON, which would break FormData, so override it here.
    // The browser adds the multipart boundary itself.
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 5 * 60 * 1000, // uploads to Cloudinary can be slow
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
    },
  });
  return data;
};

// GET /post/user/:userId -> { success, pagination, posts }
export const fetchUserPosts = async (userId, page = 1, limit = 10) => {
  const { data } = await api.get(`/post/user/${userId}`, { params: { page, limit } });
  return data;
};

// PUT /post/:id  body: { caption?, visibility? } -> { success, message, post }
// Note: the returned post has NO `user` object, so merge it into the existing post.
export const updatePost = async (id, changes) => {
  const { data } = await api.put(`/post/${id}`, changes);
  return data;
};

// DELETE /post/:id -> { success, message }
export const deletePost = async (id) => {
  const { data } = await api.delete(`/post/${id}`);
  return data;
};

// GET /post/:id -> { success, post }
// Needs optionalAuth on this route so private/followers posts resolve correctly for the owner.
export const fetchPostById = async (id) => {
  const { data } = await api.get(`/post/${id}`);
  return data;
};