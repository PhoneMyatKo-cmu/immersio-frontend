import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../authContext";

// Gates every /admin/* route on an ADMIN role. AuthProvider loads /auth/me on
// mount, so `user.role` is available here after a login redirect.
export function AdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-darkgrey text-white/60">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-teal-500" />
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
