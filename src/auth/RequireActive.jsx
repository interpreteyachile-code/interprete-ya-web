import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireActive({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.status !== "active") return <Navigate to="/pending" replace />;

  return children;
}
