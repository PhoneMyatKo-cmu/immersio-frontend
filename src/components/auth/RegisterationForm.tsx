import { useState } from 'react';
import { register } from '../../api/auth';
import type { EstimatedLevel, UserCreateRequest } from '../../types/user';
import { EstimatedLevelValues } from '../../types/user';
import { Modal } from '../common/Modal';

export function RegisterationForm() {
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

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
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
                const error_message = error.response?.data?.detail || 'An unexpected error occurred during registration. Please try again.';
                setModalState({
                    isOpen: true,
                    title: "Registration Failed",
                    message: error_message,
                    variant: 'error'
                });
            });
    }
    return (
        <div className="w-full max-w-sm">
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
                        required
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
                        required
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
                        required
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
                        required
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
                        required
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
};