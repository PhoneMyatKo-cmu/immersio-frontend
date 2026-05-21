import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
    return (
        <div className="bg-[#0a1628] h-screen flex flex-col items-center justify-center text-white">
            <h1 className='text-4xl font-bold mb-8'>Login</h1>
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