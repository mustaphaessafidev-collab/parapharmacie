import { Navigate, useLocation } from "react-router-dom";
import { getSession, pathForRole, rememberReturn, safeReturnPath } from "../../services/authService";

function ProtectedRoute({ role, children }) {
  const session = getSession();
  const location = useLocation();

  if (!session?.user) {
    const next = safeReturnPath(`${location.pathname}${location.search}`);
    const params = new URLSearchParams();
    if (next) {
      rememberReturn(next);
      params.set("next", next);
    }
    if (location.pathname.includes("/panier") || location.pathname.includes("/commander")) {
      params.set("reason", "order");
    }
    const query = params.toString();
    return <Navigate to={query ? `/login?${query}` : "/login"} replace />;
  }

  if (session.user.role !== role) {
    return <Navigate to={pathForRole(session.user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
