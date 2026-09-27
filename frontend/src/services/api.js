import axios from "axios";
import { getToken } from "../utils/token";

// TEMPORARY: hardcoded backend URL. Later we will replace this with:
// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach the JWT to every request, if we have one
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a protected request comes back 401, tell the app the session is invalid.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const isAuthRequest = error.config?.url?.startsWith("/auth/");

    // Login/register handle their own errors inline (see Login.jsx / Register.jsx).
    // Never let this interceptor react to them — that caused a double-navigation
    // race (client nav to /banned immediately followed by a full reload).
    if (!isAuthRequest) {
      if (status === 403 && data?.isBanned) {
        window.dispatchEvent(
          new CustomEvent("auth:banned", { detail: { reason: data.bannedReason, bannedAt: data.bannedAt } })
        );
      } else if (status === 401) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;