import AdminLoginForm from "../../components/admin/AdminLoginForm";
import { BrandLogo } from "../../components/common/BrandLogo";

function AdminLoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1628] px-4 py-10 text-white">
            <div className="mb-8 flex flex-col items-center gap-3">
                <BrandLogo size={56} />
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
