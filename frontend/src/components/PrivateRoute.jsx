import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Not logged in
  if (!token || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check if the user's role is included
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Unauthorized access, redirect
    if (user.role === "SuperAdmin") return <Navigate to="/" replace />;
    if (user.role === "Admin") return <Navigate to="/" replace />;
    if (user.role === "User") return <Navigate to="/create" replace />;
  }

  // Authorized: render children
  return <Outlet />;
};

export default PrivateRoute;
