// components/Sidebar/Sidebar.tsx
import { BookOpen, ChevronRight, Home, LogIn, RefreshCw, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    to: string;
    onClick?: () => void;
}

const isLoggedIn = !!localStorage.getItem('accessToken');

const navItems: SidebarItem[] = [
    { icon: isLoggedIn ? <User size={20} /> : <LogIn size={20} />,
        label: isLoggedIn ? 'Profile' : 'Login',
        to: isLoggedIn ? '/profile' : '/login'
    },
    { icon: <Home size={20} />, label: 'Home', to: '/' },
    { icon: <BookOpen size={20} />, label: 'Library', to: '/' },
    { icon: <RefreshCw size={20} />, label: 'Review', to: '/' },
];

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-white/5 bg-[#0a1628] py-4">
            {/* Logo */}
            <div className="mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold text-white">
                    I
                </div>
            </div>
            
            {/* Nav items */}
            <nav className="flex w-full flex-1 flex-col items-center gap-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        title={item.label}
                        className={({ isActive }) =>
                            `flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                                isActive
                                    ? 'bg-teal-600/15 text-teal-500'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                            }`
                        }
                    >
                        {item.icon}
                    </NavLink>
                ))}
            </nav>
            
            {/* Expand button */}
            <button
                className="mb-2 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/60 transition-all hover:bg-white/5 hover:text-white/90"
                aria-label="Expand sidebar"
            >
                <ChevronRight size={16} />
            </button>
        </aside>
    );
}