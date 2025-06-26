import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PricingPage } from './pages/PricingPage';
import { UploadPage } from './pages/UploadPage';
import { ImagesPage } from './pages/ImagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { AdminPage } from './pages/admin/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div data-theme="easyimg" className="min-h-screen">
      <Router>
        <Layout>
          <Routes>
            {/* Публичные страницы */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* Пользовательские страницы */}
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            
            {/* Админ страницы */}
            <Route path="/admin/*" element={<AdminPage />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App; 