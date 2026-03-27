/**
 * @file axiosInstance.js
 * @description Configured Axios instance shared across all API modules.
 *
 * Features:
 *  - Base URL from environment variable (no hardcoded IPs anywhere)
 *  - 401 response interceptor → auto-redirects to /login
 *  - 10-second timeout to prevent hanging requests
 *
 * VAPT: No secrets in source. All origins controlled via .env.
 */

import axios from "axios";

/** Base URL is read from the Vite environment at build time. */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — attaches the JWT access token to every request.
 * Token is stored in localStorage as "access_token" after login.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — catches 401 Unauthorized globally.
 * Clears local storage and redirects user to /login so they
 * can re-authenticate without seeing a broken UI.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      // Use window.location so BrowserRouter state is fully reset
      globalThis.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
