import api from "./api";

// POST /messages/conversations { receiverId } -> { success, conversation }
export const startConversation = async (receiverId) => {
  const { data } = await api.post("/messages/conversations", { receiverId });
  return data;
};

// GET /messages/conversations?page=&limit= -> { success, pagination, conversations }
export const fetchConversations = async (page = 1, limit = 20) => {
  const { data } = await api.get("/messages/conversations", { params: { page, limit } });
  return data;
};

// GET /messages/conversations/:id?page=&limit= -> { success, pagination, messages } (newest first)
export const fetchMessages = async (conversationId, page = 1, limit = 30) => {
  const { data } = await api.get(`/messages/conversations/${conversationId}`, {
    params: { page, limit },
  });
  return data;
};

// POST /messages/conversations/:id/messages { content } -> { success, message }
export const sendMessage = async (conversationId, content) => {
  const { data } = await api.post(`/messages/conversations/${conversationId}/messages`, {
    content,
  });
  return data;
};

// PATCH /messages/messages/:id/read -> { success, message }
export const markMessageRead = async (messageId) => {
  const { data } = await api.patch(`/messages/messages/${messageId}/read`);
  return data;
};

// DELETE /messages/messages/:id -> { success, message }
export const deleteMessage = async (messageId) => {
  const { data } = await api.delete(`/messages/messages/${messageId}`);
  return data;
};