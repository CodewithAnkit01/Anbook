import api from "./api";

// GET /notifications?page=&limit= -> { success, pagination, notifications }
export const fetchNotifications = async (page = 1, limit = 20) => {
  const { data } = await api.get("/notifications", { params: { page, limit } });
  return data;
};

// GET /notifications/unread-count -> { success, unreadCount }
export const fetchUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread-count");
  return data;
};

// PATCH /notifications/:id/read -> { success, message, notification }
export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

// PATCH /notifications/read-all -> { success, message }
export const markAllNotificationsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};

// DELETE /notifications/:id -> { success, message }
export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};