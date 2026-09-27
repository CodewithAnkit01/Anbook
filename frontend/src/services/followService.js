import api from "./api";

// POST /follow/follow/:id -> { success, message, isFollowing: true, followerCount }
export const followUser = async (userId) => {
  const { data } = await api.post(`/follow/follow/${userId}`);
  return data;
};

// DELETE /follow/unfollow/:id -> { success, message, isFollowing: false, followerCount }
export const unfollowUser = async (userId) => {
  const { data } = await api.delete(`/follow/unfollow/${userId}`);
  return data;
};

// GET /follow/followers/:id -> { success, total, followers }
export const fetchFollowers = async (userId) => {
  const { data } = await api.get(`/follow/followers/${userId}`);
  return data;
};

// GET /follow/following/:id -> { success, total, following }
export const fetchFollowing = async (userId) => {
  const { data } = await api.get(`/follow/following/${userId}`);
  return data;
};