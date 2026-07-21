import { LogOut, Users, Video } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import * as authApi from "../../api/auth";
import { useAuth } from "../../authContext";

const tabBase =
    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors";
const tabActive = "bg-teal-600/15 text-teal-400";
const tabIdle = "text-white/60 hover:bg-white/5 hover:text-white/90";

export function AdminLayout() {
    const { user } = useAuth();

    const handleLogout = async () => {
        // authApi.logout() clears tokens then hard-redirects to /login; for the
        // admin surface we send them back to the admin login instead.
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/admin/login";
        }
    };

    return (
        <div className="min-h-screen bg-darkgrey text-white">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a1628]/95 backdrop-blur">
                <div className="mx-auto flex  items-center justify-between gap-4 px-8 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold">
                            I
                        </div>
                        <span className="text-sm font-semibold tracking-wide text-white/80">
                            Admin
                        </span>
                    </div>

                    <nav className="flex items-center gap-1">
                        <NavLink
                            to="/admin/videos"
                            className={({ isActive }) =>
                                `${tabBase} ${isActive ? tabActive : tabIdle}`
                            }
                        >
                            <Video size={18} />
                            Videos
                        </NavLink>
                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) =>
                                `${tabBase} ${isActive ? tabActive : tabIdle}`
                            }
                        >
                            <Users size={18} />
                            Users
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user && (
                            <span className="hidden text-sm text-white/50 sm:inline">
                                {user.first_name} {user.last_name}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto px-8 w-full py-8">
                <Outlet />
            </main>
        </div>
    );
}
