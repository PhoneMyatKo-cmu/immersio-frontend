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
            {/* Admin chrome accent — a persistent cue that this is the back office, not the product */}
            <div className="h-1 w-full bg-amber-500" />
            <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0d1526]/95 backdrop-blur">
                <div className="mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8">
                    {/* Brand row — on mobile this shares the line with a Logout button */}
                    <div className="flex items-center justify-between md:justify-start">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold">
                                I
                            </div>
                            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/80">
                                Admin
                                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                    Console
                                </span>
                            </span>
                        </div>

                        {/* Mobile-only logout (desktop keeps it in the right-hand group) */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/90 md:hidden"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>

                    {/* Nav — full-width equal tabs on mobile, compact inline on desktop */}
                    <nav className="flex items-center gap-1">
                        <NavLink
                            to="/admin/videos"
                            className={({ isActive }) =>
                                `${tabBase} flex-1 justify-center md:flex-none md:justify-start ${
                                    isActive ? tabActive : tabIdle
                                }`
                            }
                        >
                            <Video size={18} />
                            Videos
                        </NavLink>
                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) =>
                                `${tabBase} flex-1 justify-center md:flex-none md:justify-start ${
                                    isActive ? tabActive : tabIdle
                                }`
                            }
                        >
                            <Users size={18} />
                            Users
                        </NavLink>
                    </nav>

                    {/* Desktop-only right group: user name + logout */}
                    <div className="hidden items-center gap-3 md:flex">
                        {user && (
                            <span className="text-sm text-white/50">
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

            <main className="mx-auto w-full px-4 py-8 md:px-8">
                <Outlet />
            </main>
        </div>
    );
}
