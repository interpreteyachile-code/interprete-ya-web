import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
  allowRoles = [],
  allowProfileTypes = [],
  requireStatus = "active",
}) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (requireStatus === "active") {
    if (user.status === "pending") return <Navigate to="/pending" replace />;
    if (user.status === "rejected") return <Navigate to="/login" replace />;
    if (user.status === "blocked") return <Navigate to="/login" replace />;
    if (user.status === "deleted") return <Navigate to="/login" replace />;
    if (user.status !== "active") return <Navigate to="/login" replace />;
  }

  if (allowRoles.length > 0 && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (
    allowProfileTypes.length > 0 &&
    !allowProfileTypes.includes(user.profileType)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}