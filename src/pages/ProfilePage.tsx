import { CalendarDays, Eye, EyeOff, KeyRound, LogOut, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { logout, resetPassword, updateProfile } from "../api/auth";
import { useAuth } from "../authContext";
import { BrandLoader } from "../components/common/BrandLogo";
import { Modal } from "../components/common/Modal";
import { EstimatedLevelValues, type EstimatedLevel, type User } from "../types/user";

type ProfileForm = Pick<User, 'first_name' | 'last_name' | 'email' | 'estimated_level'>;

const LEVELS: { value: EstimatedLevel; label: string; hint: string; chip: string }[] = [
    { value: EstimatedLevelValues.Beginner, label: 'Beginner', hint: 'Slow, simple speech', chip: 'bg-teal-500/15 text-teal-300' },
    { value: EstimatedLevelValues.Intermediate, label: 'Intermediate', hint: 'Everyday conversation', chip: 'bg-amber-500/15 text-amber-300' },
    { value: EstimatedLevelValues.Advanced, label: 'Advanced', hint: 'Native-speed content', chip: 'bg-rose-500/15 text-rose-300' },
];
const levelInfo = (level?: EstimatedLevel) => LEVELS.find((l) => l.value === level) ?? LEVELS[0];

const toForm = (u: User): ProfileForm => ({
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    estimated_level: u.estimated_level,
});

const card = "rounded-2xl border border-white/10 bg-[#101c30]";
const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 transition-colors focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/30";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45";
const primaryBtn = "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-[#04241f] transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50";
const ghostBtn = "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white";

type ModalState = {
    isOpen: boolean;
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    title?: string;
};

function ProfilePage() {
    const { user, loading, updateUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<ProfileForm | null>(user ? toForm(user) : null);
    const [saving, setSaving] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
    const [showPasswords, setShowPasswords] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, message: '', variant: 'info' });
    const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

    // AuthProvider loads the user asynchronously — seed the form once it arrives.
    useEffect(() => {
        if (user && !isEditing) setForm(toForm(user));
    }, [user, isEditing]);

    if (loading) return <BrandLoader label="Loading profile" className="bg-[#0a1628]" />;

    if (!user || !form) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a1628] px-4 text-center text-white">
                <p className="text-white/60">Log in to see your profile.</p>
                <Link to="/login" className={primaryBtn}>Log in</Link>
            </div>
        );
    }

    const level = levelInfo(user.estimated_level);
    const initials = `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase();
    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
        : null;

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        setForm(toForm(user));
        setIsEditing(false);
    };

    const handleSaveProfile = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await updateProfile(form);
            updateUser({ ...user, ...form, ...data });
            setIsEditing(false);
            setModalState({
                isOpen: true,
                title: "Profile Updated",
                message: "Your profile has been updated successfully.",
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Profile update failed:', error);
            setModalState({
                isOpen: true,
                title: "Update Failed",
                message: error.response?.data?.detail || "Failed to update profile.",
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelPassword = () => {
        setPasswords({ current_password: '', new_password: '' });
        setShowPasswords(false);
        setIsChangingPassword(false);
    };

    const handleSavePassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            await resetPassword(passwords.current_password, passwords.new_password);
            handleCancelPassword();
            setModalState({
                isOpen: true,
                title: "Password Changed",
                message: "Your password has been changed successfully.",
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Password reset failed:', error);
            setModalState({
                isOpen: true,
                title: "Password Change Failed",
                message: error.response?.data?.detail || "Failed to change password.",
                variant: 'error',
            });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a1628] px-4 pb-24 pt-6 text-white md:px-10 md:pb-10 md:pt-10">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="mt-1 text-sm text-white/50">Manage your account and learning level</p>

                {/* Identity */}
                <section className={`${card} relative mt-6 overflow-hidden p-5 md:p-7`}>
                    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -bottom-6 right-4 select-none font-japanese text-8xl font-bold text-white/[0.035] md:text-9xl"
                    >
                        日本語
                    </span>

                    <div className="relative flex items-center gap-4 md:gap-5">
                        {/* Rounded-square avatar echoes the logo mark */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-2xl font-bold text-[#04241f] shadow-lg shadow-teal-500/20 md:h-20 md:w-20 md:text-3xl">
                            {initials || '?'}
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-semibold md:text-2xl">
                                {user.first_name} {user.last_name}
                            </h2>
                            <p className="truncate text-sm text-white/50">{user.email}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${level.chip}`}>
                                    {level.label}
                                </span>
                                {memberSince && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/55">
                                        <CalendarDays size={13} />
                                        Member since {memberSince}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account details */}
                <section className={`${card} mt-4 p-5 md:p-7`}>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-semibold">Account details</h3>
                            <p className="text-sm text-white/45">Your name, email and study level</p>
                        </div>
                        {!isEditing && (
                            <button type="button" className={ghostBtn} onClick={() => setIsEditing(true)}>
                                <Pencil size={15} />
                                Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSaveProfile}>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                            {([
                                ['first_name', 'First name'],
                                ['last_name', 'Last name'],
                            ] as const).map(([name, label]) => (
                                <div key={name}>
                                    <label htmlFor={name} className={labelClass}>{label}</label>
                                    {isEditing ? (
                                        <input id={name} name={name} value={form[name]} onChange={handleFieldChange} required className={inputClass} />
                                    ) : (
                                        <p className="py-1 text-white">{user[name]}</p>
                                    )}
                                </div>
                            ))}

                            <div className="md:col-span-2">
                                <label htmlFor="email" className={labelClass}>Email</label>
                                {isEditing ? (
                                    <input id="email" name="email" type="email" value={form.email} onChange={handleFieldChange} required className={inputClass} />
                                ) : (
                                    <p className="break-all py-1 text-white">{user.email}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <span className={labelClass}>Study level</span>
                                {isEditing ? (
                                    <div role="radiogroup" aria-label="Study level" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        {LEVELS.map((l) => {
                                            const selected = form.estimated_level === l.value;
                                            return (
                                                <button
                                                    key={l.value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={selected}
                                                    onClick={() => setForm({ ...form, estimated_level: l.value })}
                                                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                                        selected
                                                            ? 'border-teal-500/60 bg-teal-500/10'
                                                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                                                    }`}
                                                >
                                                    <span className={`block text-sm font-semibold ${selected ? 'text-teal-300' : 'text-white'}`}>
                                                        {l.label}
                                                    </span>
                                                    <span className="block text-xs text-white/45">{l.hint}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="py-1 text-white">
                                        {level.label}
                                        <span className="text-white/40"> · {level.hint}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
                                <button type="button" className={ghostBtn} onClick={handleCancelEdit} disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className={primaryBtn} disabled={saving}>
                                    {saving ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </section>

                {/* Security */}
                <section className={`${card} mt-4 p-5 md:p-7`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/60">
                                <KeyRound size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold">Password</h3>
                                <p className="text-sm text-white/45">Change the password you use to sign in</p>
                            </div>
                        </div>
                        {!isChangingPassword && (
                            <button type="button" className={`${ghostBtn} shrink-0`} onClick={() => setIsChangingPassword(true)}>
                                Change
                            </button>
                        )}
                    </div>

                    {isChangingPassword && (
                        <form onSubmit={handleSavePassword} className="mt-5 border-t border-white/5 pt-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {([
                                    ['current_password', 'Current password', 'current-password'],
                                    ['new_password', 'New password', 'new-password'],
                                ] as const).map(([name, label, autoComplete]) => (
                                    <div key={name}>
                                        <label htmlFor={name} className={labelClass}>{label}</label>
                                        <input
                                            id={name}
                                            name={name}
                                            type={showPasswords ? 'text' : 'password'}
                                            autoComplete={autoComplete}
                                            value={passwords[name]}
                                            onChange={(e) => setPasswords({ ...passwords, [name]: e.target.value })}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords((v) => !v)}
                                    className="inline-flex items-center gap-1.5 self-start text-sm text-white/50 transition-colors hover:text-white/80"
                                >
                                    {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                                    {showPasswords ? 'Hide passwords' : 'Show passwords'}
                                </button>
                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <button type="button" className={ghostBtn} onClick={handleCancelPassword} disabled={savingPassword}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={primaryBtn}
                                        disabled={savingPassword || !passwords.current_password || !passwords.new_password}
                                    >
                                        {savingPassword ? 'Updating…' : 'Update password'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </section>

                {/* Session */}
                <div className="mt-6 flex items-center justify-between gap-4 px-1">
                    <p className="min-w-0 truncate text-sm text-white/40">Signed in as {user.email}</p>
                    <button
                        type="button"
                        onClick={logout}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-500/25 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10"
                    >
                        <LogOut size={15} />
                        Log out
                    </button>
                </div>
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                variant={modalState.variant}
                onConfirm={closeModal}
                closeOnBackdrop
            />
        </div>
    );
}

export default ProfilePage;
