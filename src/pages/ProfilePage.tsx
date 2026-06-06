import { useState } from "react";
import { logout, resetPassword, updateProfile } from "../api/auth";
import { Modal } from "../components/common/Modal";
import { EstimatedLevelValues, type User } from "../types/user";

const user: User = JSON.parse(localStorage.getItem('user') || '{}');

function ProfilePage() {
    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        message: string;
        variant: 'info' | 'success' | 'warning' | 'error';
        title?: string;
        confirmText?: string;
        onConfirm?: () => void
        closeOnBackdrop?: boolean;
        cancelRequired?:boolean
    }>({
        isOpen: false,
        message: '',
        variant: 'info',
        onConfirm: closeModal,
        closeOnBackdrop: true,
        cancelRequired: false
    });

    const [credentials, setCredentials] = useState({
        'First Name': user.first_name,
        'Last Name': user.last_name,
        'Email': user.email,
        'Estimated Level': user.estimated_level,
        'Member Since': new Date(user.created_at).toLocaleDateString(),
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedCredentials, setEditedCredentials] = useState({
        'First Name': user.first_name,
        'Last Name': user.last_name,
        'Email': user.email,
        'Estimated Level': user.estimated_level,
    });
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
    });

    const handleEditProfile = () => {
        setIsEditing(true);
    }

    const handleResetPassword = () => {
        setIsResettingPassword(true);
    }

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditedCredentials({
            ...editedCredentials,
            [e.target.name]: e.target.value,
        });
    }

    const handleEditSaveChanges = () => {
        setCredentials({
            ...credentials,
            ...editedCredentials
        });
        setIsEditing(false);
        updateProfile({
            first_name: editedCredentials['First Name'],
            last_name: editedCredentials['Last Name'],
            email: editedCredentials['Email'],
            estimated_level: editedCredentials['Estimated Level'],
        }).then((data) => {
            console.log('Profile updated successfully:', data);
            localStorage.setItem('user', JSON.stringify(data));
            setModalState({
                isOpen: true,
                title: "Profile Updated",
                message: "Your profile has been updated successfully.",
                variant: 'success'
            });
        }).catch((error) => {
            console.error('Profile update failed:', error);
            setModalState({
                isOpen: true,
                title: "Update Failed",
                message: error.response?.data?.detail || "Failed to update profile.",
                variant: 'error'
            });
        });
    }

    const handleEditCancel = () => {
        setEditedCredentials({
            'First Name': user.first_name,
            'Last Name': user.last_name,
            'Email': user.email,
            'Estimated Level': user.estimated_level,
        });
        setIsEditing(false);
    }

    const handleResetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value,
        });
    }

    const handleResetPasswordSave = () => {
        resetPassword(passwords.current_password, passwords.new_password)
            .then((data) => {
                console.log('Password reset successful:', data);
                setIsResettingPassword(false);
                setPasswords({
                    current_password: '',
                    new_password: '',
                });
                setModalState({
                    isOpen: true,
                    title: "Password Reset",
                    message: "Your password has been reset successfully.",
                    variant: 'success'
                });
            }).catch((error) => {
                console.error('Password reset failed:', error);
                setModalState({
                    isOpen: true,
                    title: "Reset Failed",
                    message: error.response?.data?.detail || "Failed to reset password.",
                    variant: 'error'
                });
            });
    }

    const handleResetPasswordCancel = () => {
        setPasswords({
            current_password: '',
            new_password: '',
        });
        setIsResettingPassword(false);
    }

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
                {!isEditing ? (
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
                ):(
                    <div>
                        <form className="space-y-4">
                            {Object.entries(editedCredentials).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="capitalize text-gray-400 font-medium mb-2">
                                        {key.replace("_", " ")}
                                    </label>
                                    {key != 'Estimated Level' ? (
                                        <input
                                            type="text"
                                            name={key}
                                            title={key}
                                            value={String(value)}
                                            onChange={handleEditChange}
                                        className="bg-white/10 border border-white/10 rounded-md p-2 placeholder:text-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ):(
                                        <select
                                            name="Estimated Level"
                                            title="Estimated Level"
                                            className="w-full px-3 py-2 rounded-md bg-[#1a2330] border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-white"
                                            value={String(value)}
                                            onChange={handleEditChange}
                                        >
                                            <option value={EstimatedLevelValues.Beginner}>Beginner</option>
                                            <option value={EstimatedLevelValues.Intermediate}>Intermediate</option>
                                            <option value={EstimatedLevelValues.Advanced}>Advanced</option>
                                        </select>
                                    )}
                                </div>
                            ))}
                        </form>
                        <div className="mt-6 flex flex-row justify-between gap-4">
                            <button
                                className="w-[45%] bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                onClick={handleEditCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-[45%] bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                onClick={handleEditSaveChanges}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {isResettingPassword && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
                        <form className="space-y-4">
                            {['current_password', 'new_password'].map((field) => (
                                <div key={field} className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-400">
                                        {field === 'current_password' ? 'Current Password' : 'New Password'}
                                    </label>
                                    <input
                                        type="password"
                                        title={field}
                                        name={field}
                                        placeholder={field === 'current_password' ? 'Enter current password' : 'Enter new password'}
                                        onChange={handleResetPasswordChange}
                                        className="w-full bg-white/10 border p-2 rounded-md border-white/10 placeholder:text-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </form>

                        <div className="mt-6 flex flex-row justify-between gap-4">
                            <button
                                className="w-[45%] bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                onClick={handleResetPasswordCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-[45%] bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                onClick={handleResetPasswordSave}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {(!isEditing && !isResettingPassword) && (
                    <div className="w-full flex flex-row justify-between gap-4">
                        <button
                            className="mt-8 w-[45%] bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                            onClick={handleEditProfile}
                        >
                            Edit Profile
                        </button>
                        
                        <button
                            className="mt-8 w-[45%] bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                            onClick={handleResetPassword}
                        >
                            Reset Password
                        </button>
                    </div>
                )}

                <button 
                    className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                variant={modalState.variant}
                confirmText={modalState.confirmText}
                onConfirm={modalState.onConfirm}
                closeOnBackdrop={modalState.closeOnBackdrop}
                cancelRequired={modalState.cancelRequired}
            />
        </div>
    )
}

export default ProfilePage;