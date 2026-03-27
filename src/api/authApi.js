/**
 * @file authApi.js
 * @description API functions for authentication: login and register.
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
