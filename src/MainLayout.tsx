import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';

export function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main style={{ marginLeft: '64px' }}>
                <Outlet />
            </main>
        </div>
    );
}