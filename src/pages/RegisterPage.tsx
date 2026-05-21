import { RegisterationForm } from "../components/auth/RegisterationForm";


function RegisterPage() {
    return (
        <div className="bg-[#0a1628] h-screen flex flex-col items-center justify-center text-white">
            <h1 className='text-4xl font-bold mb-8'>Register</h1>
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