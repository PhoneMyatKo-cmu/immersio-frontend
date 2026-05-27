import { getCurrentUser, login } from '../../api/auth';

function LoginForm() {
    return (
        <form className="w-full max-w-sm bg-[#1a2a47] p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="email">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2" htmlFor="password">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                Login
            </button>
        </form>
    );
}

function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    login(email, password)
        .then((data) => {
            console.log('Login successful:', data);
            // Store token in localStorage
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            getCurrentUser()
                .then((user) => {
                    console.log('Current user:', user);
                    localStorage.setItem('user', JSON.stringify(user));
                    // Redirect to home page
                    window.location.href = '/'
                });
            ;
        })
        .catch((error) => {
            console.error('Login failed:', error);
            // Handle login error (e.g., show error message)
        });
}

export default LoginForm;