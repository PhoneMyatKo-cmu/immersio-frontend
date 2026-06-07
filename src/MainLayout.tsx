import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';

export function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main  className='md:ml-16'>
                <Outlet />
            </main>
        </div>
    );
}