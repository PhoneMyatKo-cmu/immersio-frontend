import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';

const SIDEBAR_KEY = 'sidebar-expanded';

export function MainLayout() {
    const [expanded, setExpanded] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true');

    const toggle = () => {
        setExpanded((prev) => {
            const next = !prev;
            localStorage.setItem(SIDEBAR_KEY, String(next));
            return next;
        });
    };

    return (
        <div className="app-layout">
            <Sidebar expanded={expanded} onToggle={toggle} />
            <main
                className={`pb-16 transition-[margin] duration-200 md:pb-0 ${
                    expanded ? 'md:ml-56' : 'md:ml-16'
                }`}
            >
                <Outlet />
            </main>
        </div>
    );
}
