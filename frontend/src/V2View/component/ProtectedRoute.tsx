import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadComponent from "./LoadComponent";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[]; // Optional: restrict by user roles
}

/**
 * ProtectedRoute Component
 * Guards routes that require authentication
 * Redirects to login if user is not authenticated
 * Optionally checks user roles for authorization
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadComponent loading={true} />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based authorization if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or home if user doesn't have required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children if provided, otherwise render outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
