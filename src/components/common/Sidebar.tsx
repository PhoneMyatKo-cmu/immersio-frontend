// components/Sidebar/Sidebar.tsx
import { Home, LogIn, Upload, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarItem {
    icon: React.ReactNode
    label: string
    to: string
}

function useNavItems(): SidebarItem[] {
    const isLoggedIn = !!localStorage.getItem('accessToken')
    return [
        { icon: <Home size={20} />, label: 'Home', to: '/' },
        { icon: <Upload size={20} />, label: 'Submit', to: '/submit' },
        {
            icon: isLoggedIn ? <User size={20} /> : <LogIn size={20} />,
            label: isLoggedIn ? 'Profile' : 'Login',
            to: isLoggedIn ? '/profile' : '/login',
        },
    ]
}

const base = 'flex items-center justify-center rounded-lg transition-all'
const active = 'bg-teal-600/15 text-teal-500'
const idle = 'text-white/60 hover:bg-white/5 hover:text-white/90'

export function Sidebar() {
    const navItems = useNavItems()

    return (
        <>
            {/* Desktop: left icon rail */}
            <aside className="fixed left-0 top-0 z-50 hidden h-screen w-16 flex-col items-center border-r border-white/5 bg-[#0a1628] py-4 md:flex">
                <div className="mb-8">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold text-white">
                        I
                    </div>
                </div>
                <nav className="flex w-full flex-1 flex-col items-center gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            title={item.label}
                            className={({ isActive }) =>
                                `${base} h-10 w-10 ${isActive ? active : idle}`
                            }
                        >
                            {item.icon}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile: bottom tab bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch justify-around border-t border-white/5 bg-[#0a1628] md:hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `${base} flex-1 flex-col gap-0.5 text-[11px] ${
                                isActive ? 'text-teal-500' : 'text-white/60'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    )
}