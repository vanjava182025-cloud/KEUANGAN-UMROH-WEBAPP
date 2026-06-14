import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// This component acts as a gate at the root level.
// It checks for authentication and redirects the user to the appropriate page.
const RootRedirect = () => {
  const { user, loading } = useAuth();

  // While checking auth state, show a loading indicator or nothing
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If a user is logged in, decide their home page based on role.
  if (user) {
    // Marketing users have a different default dashboard.
    if (user.role === 'Marketing') {
      return <Navigate to="/grup" replace />;
    }
    // All other logged-in users go to the main dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // If no user is logged in, they must go to the login page.
  return <Navigate to="/login" replace />;
};

export default RootRedirect;
