/**
 * @file AuthContext.jsx
 * @description Provides authentication state (user) to the entire app.
 *
 * Pattern:
 *  - On mount, hydrates from localStorage so page refreshes keep the session.
 *  - login()  → stores user in state + localStorage
 *  - logout() → clears everything and redirects to /login
 *
 * Usage:
 *   const { user, login, logout } = useAuth();
 */

import { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

/** @returns {{ user: object|null, login: Function, logout: Function }} */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  /**
   * Called after a successful /login API response.
   * @param {{ username: string, user_id: number, role: string }} userData
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /** Clears session and redirects to login page. */
  const logout = () => {
    setUser(null);
    localStorage.clear();
    globalThis.location.href = "/login";
  };

  const value = useMemo(() => ({ user, login, logout }), [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: () => null,
};
