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
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser, loginWithSsoProvider } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

const MICROSOFT_SSO_LABEL = "Continue with Microsoft";
const SSO_STATE_KEY = "sso_state";

const resolveSsoError = (err) => {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail || err?.response?.data?.message || "";

  if (status === 404 || (detail && /not found|no account|not registered|does not exist/i.test(detail))) {
    return "Your Microsoft account is not registered in this system. Contact your administrator to get access.";
  }
  if (status === 403) {
    return "Access denied. Your account does not have permission to access this application.";
  }
  if (status === 400) {
    return detail || "Unable to sign in with Microsoft. Your account may not be registered. Contact your administrator.";
  }
  if (status === 401) {
    return "Authentication failed. Please try signing in again.";
  }
  return detail || err?.message || "SSO login failed. Please try again.";
};
const SSO_PKCE_VERIFIER_KEY = "sso_pkce_verifier";

const toBase64Url = (byteArray) =>
  btoa(String.fromCharCode(...byteArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const getMicrosoftConfig = () => {
  const tenantId = import.meta.env.VITE_SSO_MICROSOFT_TENANT_ID || "common";
  const clientId = import.meta.env.VITE_SSO_MICROSOFT_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SSO_MICROSOFT_REDIRECT_URI || `${globalThis.location.origin}/login`;
  const scope = import.meta.env.VITE_SSO_MICROSOFT_SCOPE || "openid profile email User.Read";
  const tokenUrl = import.meta.env.VITE_SSO_MICROSOFT_TOKEN_URL || `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const userInfoUrl = import.meta.env.VITE_SSO_MICROSOFT_USERINFO_URL || "https://graph.microsoft.com/oidc/userinfo";
  const allowedDomains = (import.meta.env.VITE_SSO_ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;

  return { tenantId, clientId, redirectUri, scope, tokenUrl, userInfoUrl, allowedDomains, authUrl };
};

const createPkceChallenge = async (verifier) => {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return toBase64Url(new Uint8Array(digest));
};

const buildMicrosoftAuthUrl = async () => {
  const { clientId, redirectUri, scope, authUrl } = getMicrosoftConfig();

  if (!clientId) return null;
  if (!globalThis.crypto?.subtle) return null;

  const state = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random()}`;
  const randomBytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(randomBytes);
  const codeVerifier = toBase64Url(randomBytes);
  const codeChallenge = await createPkceChallenge(codeVerifier);

  localStorage.setItem(SSO_STATE_KEY, state);
  localStorage.setItem(SSO_PKCE_VERIFIER_KEY, codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  return `${authUrl}?${params.toString()}`;
};

const exchangeMicrosoftCodeForToken = async (code, codeVerifier) => {
  const { clientId, redirectUri, scope, tokenUrl } = getMicrosoftConfig();
  const payload = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    scope,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    const errorMessage = data.error_description || data.error || "Failed to acquire Microsoft access token.";
    throw new Error(errorMessage);
  }

  return data.access_token;
};

const getMicrosoftEmail = async (accessToken) => {
  const { userInfoUrl, allowedDomains } = getMicrosoftConfig();
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Unable to read Microsoft user profile.");
  }

  const email = (
    data.email ||
    data.preferred_username ||
    data.upn ||
    data.userPrincipalName ||
    ""
  ).trim().toLowerCase();

  if (!email) {
    throw new Error("Your Microsoft account does not provide an email. Please contact your administrator.");
  }

  if (allowedDomains.length > 0) {
    const domain = email.split("@")[1] || "";
    if (!allowedDomains.includes(domain)) {
      throw new Error("This email domain is not allowed for SSO access.");
    }
  }

  return email;
};

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  /** Return to the page the user tried to reach before being redirected */
  const returnTo = location.state?.from?.pathname || "/dashboard";

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [ssoLoadingProvider, setSsoLoadingProvider] = useState("");
  const ssoHandledRef = useRef(false);

  const completeLogin = (data) => {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    const userData = {
      username: data.user_name,
      user_id: data.user_id,
      role: data.role,
    };

    login(userData);
    localStorage.removeItem("activeProject");
    localStorage.setItem("user_id", userData.user_id);
    localStorage.setItem("role", userData.role);
  };

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
      completeLogin(data);

      toast.success(`Welcome back, ${data.user_name}!`);
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSsoLogin = async () => {
    const url = await buildMicrosoftAuthUrl();
    if (!url) {
      toast.error("SSO is not configured correctly. Check Microsoft client ID and browser crypto support.");
      return;
    }

    setSsoLoadingProvider("microsoft");
    globalThis.location.assign(url);
  };

  useEffect(() => {
    if (ssoHandledRef.current) return;

    const query = new URLSearchParams(globalThis.location.search);
    const code = query.get("code");
    const stateFromUrl = query.get("state");
    const authError = query.get("error_description") || query.get("error");
    if (authError) {
      toast.error(authError);
      globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
      return;
    }
    if (!code) return;

    ssoHandledRef.current = true;

    const stateSaved = localStorage.getItem(SSO_STATE_KEY);
    const codeVerifier = localStorage.getItem(SSO_PKCE_VERIFIER_KEY);
    localStorage.removeItem(SSO_STATE_KEY);
    localStorage.removeItem(SSO_PKCE_VERIFIER_KEY);

    if (!stateFromUrl || !stateSaved || stateFromUrl !== stateSaved) {
      toast.error("Invalid SSO state. Please try again.");
      globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
      return;
    }
    if (!codeVerifier) {
      toast.error("Missing SSO verification token. Please try again.");
      globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
      return;
    }

    setSsoLoadingProvider("microsoft");
    exchangeMicrosoftCodeForToken(code, codeVerifier)
      .then((microsoftAccessToken) =>
        getMicrosoftEmail(microsoftAccessToken).then((email) => ({ microsoftAccessToken, email }))
      )
      .then(({ microsoftAccessToken, email }) => loginWithSsoProvider("microsoft", microsoftAccessToken, email))
      .then((data) => {
        completeLogin(data);
        toast.success(`Welcome back, ${data.user_name}!`);
        navigate(returnTo, { replace: true });
      })
      .catch((err) => {
        toast.error(resolveSsoError(err), { duration: 6000 });
      })
      .finally(() => {
        setSsoLoadingProvider("");
        globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
      });
  }, [login, navigate, returnTo]);

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

          <div className="auth-sso-group" role="group" aria-label="Single Sign-On options">
            <button
              type="button"
              className="auth-sso-button"
              disabled={loading || Boolean(ssoLoadingProvider)}
              onClick={handleMicrosoftSsoLogin}
            >
              {ssoLoadingProvider === "microsoft" ? "Redirecting..." : MICROSOFT_SSO_LABEL}
            </button>
          </div>

          <div className="auth-divider"><span>or use email/password</span></div>

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

          {/* <p className="auth-link">
            <Link to="/register">Create an account</Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
