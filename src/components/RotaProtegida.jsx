import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './EstilosComuns.css'; // Ensure we have access to some loader styles if needed

export default function RotaProtegida({ children, allowedRoles }) {
  const { isAuthenticated, userType, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Simple loader
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#4a90e2'
      }}>
        <div className="loader"></div>
        <p style={{ marginLeft: '10px' }}>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home/login, preserving the location they were trying to go to
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    // User is logged in but doesn't have permission
    // Redirect to their respective dashboard
    const target = userType === 'teacher' ? '/painel-professor' : '/painel-aluno';
    return <Navigate to={target} replace />;
  }

  return children;
}

RotaProtegida.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
