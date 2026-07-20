import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminRoute } from './components/admin/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SubmissionPage from './pages/SubmissionPage';
import VideoPlaybackPage from './pages/VideoPlaybackPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVideosPage from './pages/admin/AdminVideosPage';

export function AppRouter() {
    return (
        <Routes >
            <Route element={<MainLayout/>}>
                <Route path="/" element={<HomePage />} />
                <Route path="/submit" element={<SubmissionPage />} />
                <Route path="/video/:videoId" element={<VideoPlaybackPage/>} />
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
            </Route>

            {/* Admin — dedicated login + role-gated dashboard */}
            <Route path="/admin/login" element={<AdminLoginPage/>}/>
            <Route element={<AdminRoute/>}>
                <Route element={<AdminLayout/>}>
                    <Route path="/admin" element={<Navigate to="/admin/videos" replace/>}/>
                    <Route path="/admin/videos" element={<AdminVideosPage/>}/>
                    <Route path="/admin/users" element={<AdminUsersPage/>}/>
                </Route>
            </Route>
         </Routes>
    );
}
