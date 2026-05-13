import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import HomePage from './pages/HomePage';
import SubmissionPage from './pages/SubmissionPage';
export function AppRouter() {
    return (
        <Routes >
            <Route element={<MainLayout/>}>
                <Route path="/" element={<HomePage />} />
                <Route path="/submit" element={<SubmissionPage/>}/>
            </Route>
         </Routes>
    );
}