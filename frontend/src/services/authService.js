import api from "./api";

// POST /auth/register -> { success, message, token, user }
export const registerUser = async ({ username, email, password }) => {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
  });
  return data;
};

// POST /auth/login -> { success, message, token, user }
export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};