import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { register } from '../../api/auth';
import type { EstimatedLevel, UserCreateRequest } from '../../types/user';
import { EstimatedLevelValues } from '../../types/user';
import { Modal } from '../common/Modal';

// Mirrors the backend's UserCreateRequest rules (Pydantic):
//   first/last name 1–100 chars, EmailStr, password 8–128 chars AND ≤ 72 UTF-8 bytes (bcrypt).
const NAME_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const PASSWORD_MAX_BYTES = 72;
// Close to what EmailStr accepts: something@domain.tld, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'estimatedLevel';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

function validateField(field: Field, values: Values): string | undefined {
    const value = values[field];
    switch (field) {
        case 'firstName':
        case 'lastName': {
            const label = field === 'firstName' ? 'First name' : 'Last name';
            if (!value.trim()) return `${label} is required.`;
            if (value.trim().length > NAME_MAX) return `${label} must be ${NAME_MAX} characters or fewer.`;
            return;
        }
        case 'email':
            if (!value.trim()) return 'Email is required.';
            if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address, e.g. name@example.com.';
            return;
        case 'password':
            if (!value) return 'Password is required.';
            if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
            if (value.length > PASSWORD_MAX) return `Password must be ${PASSWORD_MAX} characters or fewer.`;
            // Non-ASCII characters (e.g. Japanese) take 2–4 bytes each.
            if (utf8Bytes(value) > PASSWORD_MAX_BYTES) return 'Password is too long — use fewer or simpler characters (max 72 bytes).';
            return;
        case 'confirmPassword':
            if (!value) return 'Please confirm your password.';
            if (value !== values.password) return 'Passwords do not match.';
            return;
        case 'estimatedLevel':
            if (!value) return 'Select your level.';
            return;
    }
}

const FIELDS: Field[] = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'estimatedLevel'];

function validateAll(values: Values): Errors {
    const errors: Errors = {};
    for (const field of FIELDS) {
        const message = validateField(field, values);
        if (message) errors[field] = message;
    }
    return errors;
}

// Backend field name → form field, for mapping FastAPI 422 errors inline.
const BACKEND_FIELD: Record<string, Field> = {
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'email',
    password: 'password',
    estimated_level: 'estimatedLevel',
};

type FastApiError = { loc?: (string | number)[]; msg?: string };

const inputBase = 'w-full px-3 py-2 rounded-md bg-[#1a2330] border focus:outline-none focus:ring-2 text-white';
const inputClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? 'border-red-400/70 focus:ring-red-400/60' : 'border-white/10 focus:ring-teal-500'}`;

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

    const [values, setValues] = useState<Values>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        estimatedLevel: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    // Only show a field's error once the user has left it (or tried to submit).
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const field = e.target.name as Field;
        const next = { ...values, [field]: e.target.value };
        setValues(next);
        // Re-validate live once the field has been touched, so errors clear as the user fixes them.
        if (touched[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, next) }));
        }
        // Changing the password can fix (or break) the confirmation.
        if (field === 'password' && touched.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', next) }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const field = e.target.name as Field;
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validateField(field, values) }));
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        const allErrors = validateAll(values);
        setErrors(allErrors);
        setTouched(Object.fromEntries(FIELDS.map(f => [f, true])));
        const firstInvalid = FIELDS.find(f => allErrors[f]);
        if (firstInvalid) {
            document.getElementById(firstInvalid)?.focus();
            return;
        }

        const userCreateRequest: UserCreateRequest = {
            first_name: values.firstName.trim(),
            last_name: values.lastName.trim(),
            email: values.email.trim(),
            password: values.password,
            estimated_level: (values.estimatedLevel || EstimatedLevelValues.Beginner) as EstimatedLevel,
        };

        setSubmitting(true);
        register(userCreateRequest)
            .then((data) => {
                console.log('Registration successful:', data);

                window.location.href = '/login';
            })
            .catch((error) => {
                console.error('Registration failed:', error);
                const status = error.response?.status;
                const detail = error.response?.data?.detail;

                // FastAPI 422: detail is a list of { loc, msg } — show each next to its field.
                if (status === 422 && Array.isArray(detail)) {
                    const fieldErrors: Errors = {};
                    const other: string[] = [];
                    for (const item of detail as FastApiError[]) {
                        const key = item.loc?.[item.loc.length - 1];
                        const field = typeof key === 'string' ? BACKEND_FIELD[key] : undefined;
                        const msg = (item.msg ?? 'Invalid value.').replace(/^Value error, /, '');
                        if (field) fieldErrors[field] = msg;
                        else other.push(msg);
                    }
                    setErrors(prev => ({ ...prev, ...fieldErrors }));
                    if (other.length === 0) return;
                    setModalState({ isOpen: true, title: 'Invalid Input', message: other.join('\n'), variant: 'error' });
                    return;
                }

                setModalState({
                    isOpen: true,
                    title: status === 422 ? 'Invalid Input' : 'Registration Failed',
                    message: typeof detail === 'string'
                        ? detail
                        : 'An unexpected error occurred during registration. Please try again.',
                    variant: 'error'
                });
            })
            .finally(() => setSubmitting(false));
    }

    const errorFor = (field: Field) => (touched[field] ? errors[field] : undefined);
    const fieldProps = (field: Field) => ({
        id: field,
        name: field,
        value: values[field],
        onChange: handleChange,
        onBlur: handleBlur,
        'aria-invalid': Boolean(errorFor(field)),
        'aria-describedby': errorFor(field) ? `${field}-error` : undefined,
        className: inputClass(Boolean(errorFor(field))),
    });
    const renderError = (field: Field) =>
        errorFor(field) ? (
            <p id={`${field}-error`} className="mt-1.5 text-xs text-red-300">{errorFor(field)}</p>
        ) : null;

    const passwordBytes = utf8Bytes(values.password);

    return (
        <div className="w-full max-w-sm">
            <form className="w-full max-w-sm bg-[#1a2a47] p-6 rounded-lg shadow-md" onSubmit={handleSubmit} noValidate>
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Create an Account</h2>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-white" htmlFor="firstName">
                        First Name
                    </label>
                    <input
                        {...fieldProps('firstName')}
                        type="text"
                        autoComplete="given-name"
                        maxLength={NAME_MAX}
                        placeholder="Enter your first name"
                    />
                    {renderError('firstName')}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-white" htmlFor="lastName">
                        Last Name
                    </label>
                    <input
                        {...fieldProps('lastName')}
                        type="text"
                        autoComplete="family-name"
                        maxLength={NAME_MAX}
                        placeholder="Enter your last name"
                    />
                    {renderError('lastName')}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-white" htmlFor="email">
                        Email
                    </label>
                    <input
                        {...fieldProps('email')}
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="Enter your email"
                    />
                    {renderError('email')}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-white" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            {...fieldProps('password')}
                            className={`${inputClass(Boolean(errorFor('password')))} pr-10`}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            maxLength={PASSWORD_MAX}
                            placeholder="At least 8 characters"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-white/45 transition-colors hover:text-white/80"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errorFor('password') ? (
                        renderError('password')
                    ) : (
                        <p className="mt-1.5 text-xs text-white/40">
                            8–128 characters
                            {passwordBytes > 48 && ` · ${passwordBytes}/${PASSWORD_MAX_BYTES} bytes used`}
                        </p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-white" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        {...fieldProps('confirmPassword')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        maxLength={PASSWORD_MAX}
                        placeholder="Re-enter your password"
                    />
                    {renderError('confirmPassword')}
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-white" htmlFor="estimatedLevel">
                        Estimated Level
                    </label>
                    <select {...fieldProps('estimatedLevel')}>
                        <option value="">Select your level</option>
                        <option value={EstimatedLevelValues.Beginner}>Beginner</option>
                        <option value={EstimatedLevelValues.Intermediate}>Intermediate</option>
                        <option value={EstimatedLevelValues.Advanced}>Advanced</option>
                    </select>
                    {renderError('estimatedLevel')}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? 'Creating account…' : 'Register'}
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
