import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SubmissionPage from './pages/SubmissionPage';

export function AppRouter() {
    return (
        <Routes >
            <Route element={<MainLayout/>}>
                <Route path="/" element={<HomePage />} />
                <Route path="/submit" element={<SubmissionPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
            </Route>
         </Routes>
    );
}