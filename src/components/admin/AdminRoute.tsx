import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../authContext";
import { BrandLoader } from "../common/BrandLogo";

// Gates every /admin/* route on an ADMIN role. AuthProvider loads /auth/me on
// mount, so `user.role` is available here after a login redirect.
export function AdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <BrandLoader className="bg-darkgrey" />
        );
    }

    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
