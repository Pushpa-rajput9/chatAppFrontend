import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

/** Keeps already-logged-in users out of /login and /register. */
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return <Outlet />;
};

export default PublicRoute;
