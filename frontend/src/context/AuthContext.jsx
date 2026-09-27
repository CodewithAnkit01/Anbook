import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import {
  getToken,
  getStoredUser,
  setSession,
  clearSession,
  getTokenExpiry,
  isTokenExpired,
} from "../utils/token";

import api from "../services/api";

const AuthContext = createContext(null);

const EMPTY_SESSION = {
  token: null,
  user: null,
};

// ==========================================
// LOAD INITIAL SESSION
// ==========================================

const loadInitialSession = () => {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !user || isTokenExpired(token)) {
    clearSession();

    return EMPTY_SESSION;
  }

  return {
    token,
    user,
  };
};

// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {
  const [session, setSessionState] = useState(
    loadInitialSession
  );

  const { token, user } = session;

  // ========================================
  // LOGIN / REGISTER
  // ========================================

  const setAuth = useCallback(
    (newToken, newUser) => {
      setSession(newToken, newUser);

      setSessionState({
        token: newToken,
        user: newUser,
      });
    },
    []
  );

  // ========================================
  // LOGOUT
  // ========================================

  const logout = useCallback(() => {
    clearSession();

    setSessionState(EMPTY_SESSION);
  }, []);

  // ========================================
  // UPDATE LOGGED-IN USER
  // ========================================

  const updateUser = useCallback(
    (changes) => {
      if (!token || !user) return;

      const nextUser = {
        ...user,
        ...changes,
      };

      setSession(token, nextUser);

      setSessionState({
        token,
        user: nextUser,
      });
    },
    [token, user]
  );

  // ========================================
  // SESSION EXPIRED / USER BANNED
  // ========================================

  const expireSession = useCallback(
    (reason, bannedAt) => {
      clearSession();

      setSessionState(EMPTY_SESSION);

      // --------------------------------------
      // USER WAS BANNED
      // --------------------------------------

      if (reason !== undefined) {
        sessionStorage.setItem(
          "banReason",
          JSON.stringify({
            reason,
            bannedAt,
          })
        );

        window.location.href = "/banned";

        return;
      }

      // --------------------------------------
      // NORMAL SESSION EXPIRATION
      // --------------------------------------

      toast.info(
        "Your session has expired. Please log in again.",
        {
          toastId: "session-expired",
        }
      );
    },
    []
  );

  // ========================================
  // LISTEN FOR BANNED EVENT
  // ========================================

  useEffect(() => {
    const handleBanned = (event) => {
      const {
        reason,
        bannedAt,
      } = event.detail || {};

      expireSession(reason, bannedAt);
    };

    window.addEventListener(
      "auth:banned",
      handleBanned
    );

    return () => {
      window.removeEventListener(
        "auth:banned",
        handleBanned
      );
    };
  }, [expireSession]);

  // ========================================
  // AUTO LOGOUT WHEN JWT EXPIRES
  // ========================================

  useEffect(() => {
    if (!token) return;

    const expiresAt = getTokenExpiry(token);

    if (!expiresAt) return;

    const remainingTime = Math.max(
      expiresAt - Date.now(),
      0
    );

    const timer = setTimeout(() => {
      expireSession();
    }, remainingTime);

    // --------------------------------------
    // CHECK WHEN TAB BECOMES VISIBLE
    // --------------------------------------

    const checkWhenVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() >= expiresAt
      ) {
        expireSession();
      }
    };

    document.addEventListener(
      "visibilitychange",
      checkWhenVisible
    );

    return () => {
      clearTimeout(timer);

      document.removeEventListener(
        "visibilitychange",
        checkWhenVisible
      );
    };
  }, [token, expireSession]);

  // ========================================
  // HANDLE BACKEND 401
  // ========================================

  useEffect(() => {
    if (!token) return;

    window.addEventListener(
      "auth:unauthorized",
      expireSession
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        expireSession
      );
    };
  }, [token, expireSession]);

  // ========================================
  // AUTH CONTEXT VALUE
  // ========================================

  const value = {
    user,
    token,

    isAuthenticated: Boolean(
      token && user
    ),

    setAuth,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// USE AUTH
// ==========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>"
    );
  }

  return context;
};

// ==========================================
// FETCH MY PROFILE
// ==========================================

export const fetchMyProfile = async () => {
  const { data } = await api.get(
    "/users/me"
  );

  return data;
};

