import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
  allowRoles = [],
  allowProfileTypes = [],
  requireStatus = "active", // active | any
}) {
  const { user } = useAuth();
  const loc = useLocation();

  // 1) Sin sesión
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  // 2) Estado
  if (requireStatus === "active") {
    if (user.status === "pending") return <Navigate to="/pending" replace />;
    if (user.status === "rejected") return <Navigate to="/login" replace />;
  }

  // 3) Roles
  if (allowRoles.length > 0 && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4) ProfileType
  if (
    allowProfileTypes.length > 0 &&
    !allowProfileTypes.includes(user.profileType)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}