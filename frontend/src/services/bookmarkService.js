import api from "./api";

// POST /bookmarks/:postId -> { success, message, isSaved: true, bookmark }
export const bookmarkPost = async (postId) => {
  const { data } = await api.post(`/bookmarks/${postId}`);
  return data;
};

// DELETE /bookmarks/:postId -> { success, message, isSaved: false }
export const removeBookmark = async (postId) => {
  const { data } = await api.delete(`/bookmarks/${postId}`);
  return data;
};

// GET /bookmarks?page=&limit= -> { success, pagination, posts }
export const fetchBookmarks = async (page = 1, limit = 10) => {
  const { data } = await api.get("/bookmarks", { params: { page, limit } });
  return data;
};