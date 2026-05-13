import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Use named import

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  try {
    const decoded = jwtDecode(token); // Use named jwtDecode
    if (!allowedRoles.includes(decoded.role)) return <Navigate to="/" />;
    return children;
  } catch (err) {
    localStorage.removeItem('token'); // Remove invalid token
    return <Navigate to="/login" />;
  }
}

export default PrivateRoute;