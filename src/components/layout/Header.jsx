/**
 * @file Header.jsx
 * @description Top navigation bar with brand, All Projects link, and user profile dropdown.
 *
 * Reads user from AuthContext — no prop drilling required.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

import companyLogo from "../../assets/company_logo.png";

const USER_PLACEHOLDER =
  "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&rounded=true";

const Header = () => { // eslint-disable-line react/prop-types
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setShowProfileMenu((v) => !v);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-top">
        {/* LEFT: BRAND */}
        <div
          className="navbar-brand"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/dashboard")}
        >
          <div className="brand-icon">
            <span />
          </div>
          <span className="brand-text">AL TCMS</span>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="navbar-right">
          <span
            className="nav-link-blue"
            onClick={() => navigate("/projectlist")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/projectlist")}
          >
            All Projects
          </span>

          {/* Profile section */}
          <div className="profile-section" ref={menuRef}>
            <img
              src={user?.avatar || USER_PLACEHOLDER}
              alt="Profile"
              className="profile-img"
              onClick={toggleMenu}
            />

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-name">{user?.username || "Admin User"}</div>
                  <div className="dropdown-role">{user?.role || "User"}</div>
                </div>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item logout"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="nav-divider" />

          <div className="secondary-logo">
            <img src={companyLogo} alt="Company Logo" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
