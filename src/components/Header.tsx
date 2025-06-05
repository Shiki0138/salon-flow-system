import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">H</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">サロン</h1>
            <p className="text-xs text-gray-500 mt-1">次回予約システム v1.0</p>
          </div>

          {/* ナビゲーション */}
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              予約作成
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              管理画面
            </Link>

            {/* ユーザー情報 */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="プロフィール"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">
                  {user?.displayName || 'ユーザー'}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 