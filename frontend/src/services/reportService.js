import api from "./api";

// POST /reports { targetType, targetId, reason, description? } -> { success, message, report }
export const createReport = async (payload) => {
  const { data } = await api.post("/reports", payload);
  return data;
};

// GET /reports/my?page=&limit= -> { success, pagination, reports }
export const fetchMyReports = async (page = 1, limit = 10) => {
  const { data } = await api.get("/reports/my", { params: { page, limit } });
  return data;
};