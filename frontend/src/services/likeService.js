import api from "./api";

// POST /likes/:postId -> { success, message, likeCount, isLiked: true }
export const likePost = async (postId) => {
  const { data } = await api.post(`/likes/${postId}`);
  return data;
};

// DELETE /likes/:postId -> { success, message, likeCount, isLiked: false }
export const unlikePost = async (postId) => {
  const { data } = await api.delete(`/likes/${postId}`);
  return data;
};

// GET /likes/:postId/users -> { success, total, users: [{ id, username, profileImage, isVerified }] }
export const fetchPostLikes = async (postId) => {
  const { data } = await api.get(`/likes/${postId}/users`);
  return data;
};