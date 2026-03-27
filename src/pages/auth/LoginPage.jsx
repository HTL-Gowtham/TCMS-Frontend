/**
 * @file LoginPage.jsx
 * @description Login form. On success, redirects to the originally-requested
 *              page (stored in location.state.from) or /dashboard.
 *
 * Auth flow:
 *  1. User submits credentials → loginUser() API call
 *  2. AuthContext.login() stores the user
 *  3. navigate() to returnTo or /dashboard
 *
 * VAPT:
 *  - No credentials stored beyond what AuthContext specifies
 *  - DOMPurify not needed here (no HTML rendered from server)
 *  - alert() replaced with react-hot-toast
 */

/* eslint-disable */
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  /** Return to the page the user tried to reach before being redirected */
  const returnTo = location.state?.from?.pathname || "/dashboard";

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email.trim() || !credentials.password) {
      toast.error("Please enter your credentials");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(credentials);

      // Store JWT tokens for use by axiosInstance request interceptor
      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const userData = {
        username: data.user_name,
        user_id:  data.user_id,
        role:     data.role,
      };

      login(userData);
      localStorage.removeItem("activeProject"); // Fresh session
      localStorage.setItem("user_id", userData.user_id);
      localStorage.setItem("role",    userData.role);

      toast.success(`Welcome back, ${data.user_name}!`);
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="auth-topbar">
        <div className="auth-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="auth-logo-box" />
          <span className="auth-brand-text">AL TCM</span>
        </div>
      </div>

      {/* Login card */}
      <div className="auth-login-wrapper">
        <div className="auth-login-card">
          <h2 className="auth-title">Login</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              className="auth-input"
              autoComplete="email"
              autoFocus
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="auth-input"
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="auth-link">
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
