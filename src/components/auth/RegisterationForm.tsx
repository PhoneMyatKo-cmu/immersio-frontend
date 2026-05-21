import { register } from '../../api/auth';
import type { EstimatedLevel, UserCreateRequest } from '../../types/user';
import { EstimatedLevelValues } from '../../types/user';

export function RegisterationForm() {
    return (
        <form className="w-full max-w-sm bg-[#1a2a47] p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Create an Account</h2>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white" htmlFor="firstName">
                    First Name
                </label>
                <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white" htmlFor="lastName">
                    Last Name
                </label>
                <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-white" htmlFor="email">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-white" htmlFor="password">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-white" htmlFor="estimatedLevel">
                    Estimated Level
                </label>
                <select
                    id="estimatedLevel"
                    name="estimatedLevel"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                >
                    <option value="">Select your level</option>
                    <option value={EstimatedLevelValues.Beginner}>Beginner</option>
                    <option value={EstimatedLevelValues.Intermediate}>Intermediate</option>
                    <option value={EstimatedLevelValues.Advanced}>Advanced</option>
                </select>
            </div>

            <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                Register
            </button>
        </form>
    )
};

function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const first_name = formData.get('firstName') as string;
    const last_name = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const estimated_level = formData.get('estimatedLevel') as EstimatedLevel || EstimatedLevelValues.Beginner;

    const userCreateRequest: UserCreateRequest = {
        first_name,
        last_name,
        email,
        password,
        estimated_level
    };

    register(userCreateRequest)
        .then((data) => {
            console.log('Registration successful:', data);

            window.location.href = '/login';
        })
        .catch((error) => {
            console.error('Registration failed:', error);
            // Handle registration error (e.g., show error message)
        });
}