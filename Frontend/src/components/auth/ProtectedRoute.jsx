import { Navigate } from "react-router-dom";
import { getSession, pathForRole } from "../../services/authService";

function ProtectedRoute({ role, children }) {
  const session = getSession();

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.role !== role) {
    return <Navigate to={pathForRole(session.user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
