import api from "./api";

// GET /admin/dashboard -> { totalUsers, totalPosts, totalComments, pendingReports, bannedUsers }
export const fetchAdminDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data.data;
};

// GET /admin/reports?status=&targetType=&page=&limit= -> { reports, pagination }
export const fetchAdminReports = async (params = {}) => {
  const { data } = await api.get("/admin/reports", { params });
  return data.data;
};

// GET /admin/reports/:id -> full report with reporter email + reviewer
export const fetchAdminReportById = async (id) => {
  const { data } = await api.get(`/admin/reports/${id}`);
  return data.data;
};

// PATCH /admin/reports/:id { status } -> updated report
export const updateAdminReportStatus = async (id, status) => {
  const { data } = await api.patch(`/admin/reports/${id}`, { status });
  return data.data;
};

// GET /admin/users?search=&role=&isBanned=&page= -> { users, pagination }
export const fetchAdminUsers = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data.data;
};

// PATCH /admin/users/:id/ban { reason } -> updated user
export const banAdminUser = async (id, reason) => {
  const { data } = await api.patch(`/admin/users/${id}/ban`, { reason });
  return data.data;
};

// PATCH /admin/users/:id/unban -> updated user
export const unbanAdminUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/unban`);
  return data.data;
};

// GET /admin/posts?search=&page= -> { posts, pagination }
export const fetchAdminPosts = async (params = {}) => {
  const { data } = await api.get("/admin/posts", { params });
  return data.data;
};

// DELETE /admin/posts/:id
export const deleteAdminPost = async (id) => {
  const { data } = await api.delete(`/admin/posts/${id}`);
  return data;
};

// GET /admin/comments?search=&page= -> { comments, pagination }
export const fetchAdminComments = async (params = {}) => {
  const { data } = await api.get("/admin/comments", { params });
  return data.data;
};

// DELETE /admin/comments/:id
export const deleteAdminComment = async (id) => {
  const { data } = await api.delete(`/admin/comments/${id}`);
  return data;
};

// POST /admin/admins { userId } -> promoted user (SUPERADMIN only)
export const promoteToAdmin = async (userId) => {
  const { data } = await api.post("/admin/admins", { userId });
  return data.data;
};

// DELETE /admin/admins/:id -> demoted user (SUPERADMIN only)
export const demoteAdmin = async (id) => {
  const { data } = await api.delete(`/admin/admins/${id}`);
  return data.data;
};