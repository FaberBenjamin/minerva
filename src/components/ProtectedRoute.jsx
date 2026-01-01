import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // TODO: Firebase Auth state kezelés (Fázis 2)
  // Egyelőre mindig false, mert még nincs auth implementálva
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
