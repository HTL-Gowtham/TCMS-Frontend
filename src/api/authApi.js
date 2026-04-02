/**
 * @file authApi.js
 * @description API functions for authentication: login, register, and SSO.
 */

import axiosInstance from "./axiosInstance";

/**
 * Log in a user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access: string, refresh: string, user_id: number, user_name: string, role: string }>}
 */
export const loginUser = ({ email, password }) =>
  axiosInstance.post("/token/", { email, password }).then((r) => r.data);

/**
 * Register / create a new user.
 * Requires PM-role JWT token (handled by axiosInstance interceptor).
 * @param {{ username: string, email: string, password: string, name: string, employee_id: string, company_name: string, role: string }} payload
 * @returns {Promise<any>}
 */
export const registerUser = (payload) =>
  axiosInstance.post("/users/signup/", payload).then((r) => r.data);

/**
 * Authenticate with Microsoft using an OAuth access token.
 * @param {string} accessToken
 * @param {string} [email]
 * @returns {Promise<{ access: string, refresh: string, user_id: number, user_name: string, role: string }>}
 */
export const loginWithMicrosoft = (accessToken, email) =>
  axiosInstance
    .post("/users/auth/microsoft/", {
      access_token: accessToken,
      ...(email ? { email } : {}),
    })
    .then((r) => r.data);

/**
 * Generic SSO login entry point for provider-based expansion.
 * @param {"microsoft"|"google"|"okta"} provider
 * @param {string} token
 * @param {string} [email]
 */
export const loginWithSsoProvider = (provider, token, email) => {
  switch (provider) {
    case "microsoft":
      return loginWithMicrosoft(token, email);
    default:
      return Promise.reject(new Error(`Unsupported SSO provider: ${provider}`));
  }
};
