const TOKEN_KEY = "anbook_token";
const USER_KEY = "anbook_user";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // storage unavailable, nothing to clear
  }
};

// Reads "exp" from the JWT payload (no library needed).
// Returns the expiry as a millisecond timestamp, or null if unreadable.
// This only READS the token for timing. The backend is what actually verifies it.
export const getTokenExpiry = (token) => {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
};

// A token we can't read is treated as expired.
export const isTokenExpired = (token) => {
  const expiresAt = getTokenExpiry(token);
  return expiresAt === null || Date.now() >= expiresAt;
};