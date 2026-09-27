import api from "./api";

// GET /comments/:postId
export const fetchComments = async (
  postId,
  page = 1,
  limit = 10
) => {
  const { data } = await api.get(
    `/comments/${postId}`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return data;
};

// GET /comments/:postId/count
export const getCommentCount = async (postId) => {
  const { data } = await api.get(
    `/comments/${postId}/count`
  );

  return data;
};

// POST /comments/:postId
export const createComment = async (
  postId,
  content
) => {
  const { data } = await api.post(
    `/comments/${postId}`,
    {
      content,
    }
  );

  return data;
};

// GET /comments/:commentId/replies
export const fetchReplies = async (
  commentId,
  page = 1,
  limit = 10
) => {
  const { data } = await api.get(
    `/comments/${commentId}/replies`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return data;
};

// POST /comments/:commentId/reply
export const createReply = async (
  commentId,
  content
) => {
  const { data } = await api.post(
    `/comments/${commentId}/reply`,
    {
      content,
    }
  );

  return data;
};

// PUT /comments/:commentId
export const updateComment = async (
  commentId,
  content
) => {
  const { data } = await api.put(
    `/comments/${commentId}`,
    {
      content,
    }
  );

  return data;
};

// DELETE /comments/:commentId
export const deleteComment = async (commentId) => {
  const { data } = await api.delete(
    `/comments/${commentId}`
  );

  return data;
};