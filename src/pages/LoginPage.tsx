import LoginForm from '../components/auth/LoginForm';
import { BrandLogo } from '../components/common/BrandLogo';

function LoginPage() {
    return (
        <div className="bg-[#0a1628] min-h-screen py-10 px-4 flex flex-col items-center justify-center text-white">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <BrandLogo size={64} />
                <h1 className='text-3xl font-bold'>Welcome back</h1>
                <p className="text-sm text-white/50">Learn Japanese from real YouTube videos</p>
            </div>
            <LoginForm />
            <p className="mt-4">
                Don't have an account?{' '}
                <a href="/register" className="text-teal-500 hover:underline">
                    Register here
                </a>
            </p>
        </div>
    );
}

export default LoginPage;