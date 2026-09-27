import { RegisterationForm } from "../components/auth/RegisterationForm";
import { BrandLogo } from '../components/common/BrandLogo';


function RegisterPage() {
    return (
        <div className="bg-[#0a1628] min-h-screen py-10 px-4 flex flex-col items-center justify-center text-white">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <BrandLogo size={64} />
                <h1 className='text-3xl font-bold'>Create your account</h1>
                <p className="text-sm text-white/50">Learn Japanese from real YouTube videos</p>
            </div>
            <RegisterationForm />
            <p className="mt-4">
                Already have an account?{' '}
                <a href="/login" className="text-teal-500 hover:underline">
                    Login here
                </a>
            </p>
        </div>
    );
}

export default RegisterPage;