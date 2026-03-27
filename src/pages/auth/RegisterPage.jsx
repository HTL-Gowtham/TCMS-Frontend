/**
 * @file RegisterPage.jsx
 * @description User registration form with password-strength indicator.
 *
 * VAPT:
 *  - Client-side validation only for UX; server validates authoritatively
 *  - No plaintext passwords stored in state beyond the controlled input
 */

/* eslint-disable */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../api/authApi";
import "./RegisterPage.css";

const checkStrength = (password) => {
  let score = 0;
  if (password.length >= 8)       score++;
  if (/[0-9]/.test(password))     score++;
  if (/[a-z]/.test(password))     score++;
  if (/[A-Z]/.test(password))     score++;
  if (/[^0-9a-zA-Z]/.test(password)) score++;
  return ["Very Weak", "Weak", "Good", "Strong", "Very Strong"][score - 1] || "Very Weak";
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email:           "",
    employeeID:      "",
    employeeName:    "",
    password:        "",
    confirmpassword: "",
  });

  const [passStrength, setPassStrength] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPassStrength(checkStrength(value));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { email, employeeID, employeeName, password, confirmpassword } = formData;

    if (!email || !employeeID || !employeeName || !password || !confirmpassword) {
      setErrorMessage("All fields are required");
      return;
    }
    if (password !== confirmpassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const payload = {
      email,
      employee_id: Number(employeeID),
      name:        employeeName,
      password,
    };

    setLoading(true);
    try {
      await registerUser(payload);
      toast.success("Registered successfully! Await admin approval.");
      navigate("/login");
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="reg-header">
        <div className="reg-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="reg-logo-text">AL TCM</span>
        </div>
        <h1 className="reg-header-title">Create Account</h1>
      </header>

      <div className="register-container">
        <div className="register-card">
          <h2 className="register-name">Register</h2>

          <form onSubmit={handleSubmit}>
            <input name="email"        placeholder="Email"       onChange={handleChange} autoComplete="email" />
            <input name="employeeID"   placeholder="Employee ID" onChange={handleChange} />
            <input name="employeeName" placeholder="Full Name"   onChange={handleChange} autoComplete="name" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              autoComplete="new-password"
            />
            {formData.password && (
              <p className="pass-strength">Strength: {passStrength}</p>
            )}

            <input
              type={showPassword ? "text" : "password"}
              name="confirmpassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              autoComplete="new-password"
            />

            <label className="show-pass-label">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
              />
              {" "}Show Password
            </label>

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            <button type="submit" className="btn-reg" disabled={loading}>
              {loading ? "Registering..." : "REGISTER"}
            </button>

            <p className="loginlink">
              <Link to="/login">Already a user? Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
