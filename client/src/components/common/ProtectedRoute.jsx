import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-600 mb-4">
          You do not have the required permissions to view this section.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
