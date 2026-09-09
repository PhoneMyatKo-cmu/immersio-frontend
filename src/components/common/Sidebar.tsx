// components/Sidebar/Sidebar.tsx
import {
    ChevronLeft,
    ChevronRight,
    Home,
    LayoutDashboardIcon,
    Library,
    LogIn,
    LucideBookOpen,
    MoreHorizontal,
    Shield,
    Upload,
    User,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../authContext'
import BottomSheet from '../videoPlayer/BottomSheet'

interface SidebarItem {
    icon: React.ReactNode
    label: string
    // Compact label for the cramped mobile bottom bar (falls back to `label`).
    shortLabel?: string
    to: string
    // Primary items live in the mobile bottom bar; the rest go to the "More" sheet.
    primary?: boolean
}

function useNavItems(): SidebarItem[] {
    const { isAuthenticated, user } = useAuth()
    return [
        { icon: <Home size={20} />, label: 'Home', to: '/', primary: true },
        { icon: <LayoutDashboardIcon size={20} />, label: 'Progress', to: '/dashboard', primary: true },
        { icon: <Library size={20} />, label: 'Library', to: '/library', primary: true },
        { icon: <LucideBookOpen size={20} />, label: 'Vocabulary Review', shortLabel: 'Review', to: '/review', primary: true },
        { icon: <Upload size={20} />, label: 'Submit', to: '/submit' },
        // Only admins see the console link — hidden from learners and anon users.
        ...(user?.role === 'ADMIN'
            ? [{ icon: <Shield size={20} />, label: 'Admin', to: '/admin' }]
            : []),
        {
            icon: isAuthenticated ? <User size={20} /> : <LogIn size={20} />,
            label: isAuthenticated ? 'Profile' : 'Login',
            to: isAuthenticated ? '/profile' : '/login',
        },
    ]
}

const base = 'flex items-center rounded-lg transition-all'
const active = 'bg-teal-600/15 text-teal-500'
const idle = 'text-white/60 hover:bg-white/5 hover:text-white/90'

interface SidebarProps {
    expanded: boolean
    onToggle: () => void
}

export function Sidebar({ expanded, onToggle }: SidebarProps) {
    const navItems = useNavItems()
    const primaryItems = navItems.filter((item) => item.primary)
    const moreItems = navItems.filter((item) => !item.primary)
    const [moreOpen, setMoreOpen] = useState(false)
    const { pathname } = useLocation()
    // Highlight the "More" tab when the active route lives inside the sheet.
    const moreActive = moreItems.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))

    return (
        <>
            {/* Desktop: collapsible left rail */}
            <aside
                className={`fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-white/5 bg-[#0a1628] py-4 transition-[width] duration-200 md:flex ${
                    expanded ? 'w-56' : 'w-16'
                }`}
            >
                {/* Brand */}
                <div className={`mb-8 flex items-center ${expanded ? 'gap-2 px-3' : 'justify-center'}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-lg font-bold text-white">
                        I
                    </div>
                    {expanded && <span className="text-lg font-semibold text-white">Immersio</span>}
                </div>

                {/* Nav */}
                <nav className={`flex w-full flex-1 flex-col gap-1 ${expanded ? 'px-2' : 'items-center'}`}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            title={item.label}
                            className={({ isActive }) =>
                                `${base} h-10 ${
                                    expanded ? 'w-full justify-start gap-3 px-3' : 'w-10 justify-center'
                                } ${isActive ? active : idle}`
                            }
                        >
                            <span className="shrink-0">{item.icon}</span>
                            {expanded && <span className="truncate text-sm">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse toggle */}
                <div className={`mt-2 flex ${expanded ? 'px-2' : 'justify-center'}`}>
                    <button
                        type="button"
                        onClick={onToggle}
                        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                        aria-expanded={expanded}
                        className={`${base} h-10 ${
                            expanded ? 'w-full justify-start gap-3 px-3' : 'w-10 justify-center'
                        } ${idle}`}
                    >
                        <span className="shrink-0">
                            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </span>
                        {expanded && <span className="text-sm">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile: bottom tab bar — 4 primary destinations + a "More" overflow */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch justify-around border-t border-white/5 bg-[#0a1628] md:hidden">
                {primaryItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            `${base} flex-1 flex-col justify-center gap-0.5 text-[11px] ${
                                isActive ? 'text-teal-500' : 'text-white/60'
                            }`
                        }
                    >
                        {item.icon}
                        <span>{item.shortLabel ?? item.label}</span>
                    </NavLink>
                ))}
                <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    aria-label="More navigation"
                    className={`${base} flex-1 flex-col justify-center gap-0.5 text-[11px] ${
                        moreActive ? 'text-teal-500' : 'text-white/60'
                    }`}
                >
                    <MoreHorizontal size={20} />
                    <span>More</span>
                </button>
            </nav>

            {/* Mobile: overflow sheet for the non-primary destinations */}
            <BottomSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)}>
                <div className="px-4 pb-8 pt-1">
                    <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">More</p>
                    <div className="flex flex-col">
                        {moreItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMoreOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                                        isActive ? active : 'text-white/80 hover:bg-white/5'
                                    }`
                                }
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </BottomSheet>
        </>
    )
}
