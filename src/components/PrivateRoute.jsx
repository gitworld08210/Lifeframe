import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firebaseReady } from '../firebase';

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (!firebaseReady) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Configuration Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Firebase is not configured. Please add your environment variables to a <code>.env</code> file to use Lifeframe.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            See <code>.env.example</code> for the required variables.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
