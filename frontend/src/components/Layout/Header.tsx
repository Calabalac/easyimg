import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar sticky top-0 z-50 px-4 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-md">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-base-100 tracking-widest">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 align-middle">
            <rect x="4" y="4" width="24" height="24" rx="8" fill="#23272f" />
            <text x="16" y="22" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">EI</text>
          </svg>
          EASYIMG
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-glass">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/pricing">Тарифы</Link></li>
          <li><Link to="/upload">Загрузить</Link></li>
          <li><Link to="/images">Галерея</Link></li>
          <li><Link to="/profile">Профиль</Link></li>
          <li><Link to="/subscription">Подписка</Link></li>
          <li><Link to="/admin">Админка</Link></li>
        </ul>
      </div>
      
      <div className="navbar-end">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {user?.email.charAt(0).toUpperCase()}
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user?.email}</span>
                <span className="badge badge-sm">{user?.role}</span>
              </li>
              <li><Link to="/profile">Профиль</Link></li>
              <li><Link to="/subscription">Подписка</Link></li>
              <li><button onClick={handleLogout}>Выйти</button></li>
            </ul>
          </div>
        ) : (
          <div className="space-x-2">
            <Link to="/auth/login" className="btn btn-ghost">
              Войти
            </Link>
            <Link to="/auth/register" className="btn btn-primary">
              Регистрация
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile menu */}
      <div className="dropdown lg:hidden">
        <div tabIndex={0} role="button" className="btn btn-ghost">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl w-52">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/pricing">Тарифы</Link></li>
          <li><Link to="/upload">Загрузить</Link></li>
          <li><Link to="/images">Галерея</Link></li>
          <li><Link to="/profile">Профиль</Link></li>
          <li><Link to="/subscription">Подписка</Link></li>
          <li><Link to="/admin">Админка</Link></li>
        </ul>
      </div>
    </header>
  );
}; 