import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/authRoutes';
import type { UserRole } from '@/types/user';

function FullscreenRouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your workspace...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { isAuthenticated, loading, role, isAccessAllowed } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenRouteLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAccessAllowed) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultAppRoute(role)} replace />;
  }

  if (allowedRoles && !role) return <FullscreenRouteLoader />;

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading, role, isAccessAllowed } = useAuth();

  if (loading) return <FullscreenRouteLoader />;

  if (isAuthenticated) {
    if (!isAccessAllowed) return <Navigate to="/" replace />;
    if (!role) return <FullscreenRouteLoader />;
    return <Navigate to={getDefaultAppRoute(role)} replace />;
  }

  return <Outlet />;
}
