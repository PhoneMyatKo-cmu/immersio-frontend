import { useState } from "react";
import { getCurrentUser, login } from "../../api/auth";
import { Modal } from "../common/Modal";

function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

// Admin login reuses /auth/login, then gates on role via /auth/me. A learner can
// authenticate here, so we reject non-admins and clear their tokens rather than
// dropping them into the dashboard.
function AdminLoginForm() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        setSubmitting(true);
        setError(null);
        try {
            const data = await login(email, password);
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);

            const user = await getCurrentUser();
            if (user.role !== "ADMIN") {
                clearTokens();
                setError(
                    "Admin privileges required. This account is not authorized to access the admin dashboard.",
                );
                return;
            }

            localStorage.setItem("user", JSON.stringify(user));
            // Full reload so AuthProvider re-reads the token and hydrates `user`
            // (with role) before AdminRoute evaluates.
            window.location.href = "/admin";
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ??
                "An unexpected error occurred during login. Please try again.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <form
                className="w-full max-w-sm rounded-lg bg-[#1a2a47] p-6 shadow-md"
                onSubmit={handleSubmit}
            >
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-bold" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your admin email"
                        className="w-full rounded-md border border-white/10 bg-[#1a2330] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-bold" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="Enter your password"
                        className="w-full rounded-md border border-white/10 bg-[#1a2330] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md bg-teal-600 px-4 py-2 font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                    {submitting ? "Signing in…" : "Login"}
                </button>
            </form>

            <Modal
                isOpen={error !== null}
                onClose={() => setError(null)}
                title="Login Failed"
                message={error ?? ""}
                variant="error"
            />
        </div>
    );
}

export default AdminLoginForm;
