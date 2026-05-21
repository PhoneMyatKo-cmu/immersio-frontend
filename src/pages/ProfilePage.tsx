import { logout } from "../api/auth";
import type { User } from "../types/user";

const user: User = JSON.parse(localStorage.getItem('user') || '{}');

function ProfilePage() {
    const credentials = {
        'First Name': user.first_name,
        'Last Name': user.last_name,
        'Email': user.email,
        'Estimated Level': user.estimated_level,
        'Member Since': new Date(user.created_at).toLocaleDateString(),
    };
    return (
        <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-white/10 shadow-2xl p-8">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-gray-400 mt-2">
                        Your account information
                    </p>
                </div>

                <div className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center text-white text-2xl font-bold mb-4 uppercase">
                    { user.first_name.charAt(0) + user.last_name.charAt(0) }
                </div>
                <div className="space-y-4">
                    {Object.entries(credentials).map(([key, value]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-5 py-4 hover:bg-white/10 transition"
                        >
                            <span className="capitalize text-gray-400 font-medium">
                                {key.replace("_", " ")}
                            </span>

                            <span className="font-semibold text-white break-all text-right">
                                {String(value)}
                            </span>
                        </div>
                    ))}
                </div>

                <button 
                    className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default ProfilePage;