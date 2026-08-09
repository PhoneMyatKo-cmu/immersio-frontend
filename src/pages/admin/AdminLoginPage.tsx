import AdminLoginForm from "../../components/admin/AdminLoginForm";

function AdminLoginPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#0a1628] text-white">
            <div className="mb-8 flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-2xl font-bold">
                    I
                </div>
                <h1 className="text-3xl font-bold">Admin Login</h1>
                <p className="text-sm text-white/50">
                    Sign in with an administrator account
                </p>
            </div>
            <AdminLoginForm />
        </div>
    );
}

export default AdminLoginPage;
