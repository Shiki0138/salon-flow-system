import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import ReservationFlow from './components/ReservationFlow';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import { useEffect } from 'react';

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

function App() {
  const { user, loading } = useAuth();

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログインしていない場合はログイン画面
  if (!user) {
    return <Login />;
  }

  // ログイン済みの場合はメインアプリ
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ReservationFlow />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App; 