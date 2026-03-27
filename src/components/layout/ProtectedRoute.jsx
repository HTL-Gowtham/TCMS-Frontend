/**
 * @file ProtectedRoute.jsx
 * @description Guards authenticated routes.
 *
 * If the user is not logged in, redirects to /login and preserves
 * the current URL in location.state.from so LoginPage can redirect
 * back after a successful login.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* eslint-disable react/prop-types */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Pass the attempted URL so LoginPage can redirect there after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
