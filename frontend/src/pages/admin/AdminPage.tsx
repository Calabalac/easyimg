import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Заглушки для компонентов админки
const Dashboard: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-base-100">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="stat bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
        <div className="stat-title text-base-200">Total images</div>
        <div className="stat-value text-primary">1,234</div>
        <div className="stat-desc text-base-300">+12% this month</div>
      </div>
      <div className="stat bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
        <div className="stat-title text-base-200">Users</div>
        <div className="stat-value text-secondary">567</div>
        <div className="stat-desc text-base-300">+8% this month</div>
      </div>
      <div className="stat bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
        <div className="stat-title text-base-200">Storage</div>
        <div className="stat-value">12.5 GB</div>
        <div className="stat-desc text-base-300">of 100 GB</div>
      </div>
      <div className="stat bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
        <div className="stat-title text-base-200">Active subscriptions</div>
        <div className="stat-value text-accent">89</div>
        <div className="stat-desc text-base-300">+5% this month</div>
      </div>
    </div>
  </div>
);

const Users: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-base-100">User management</h2>
    <div className="card bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
      <div className="card-body">
        <p className="text-base-200">User table and role/status management coming soon.</p>
      </div>
    </div>
  </div>
);

const Images: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-base-100">Image moderation</h2>
    <div className="card bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
      <div className="card-body">
        <p className="text-base-200">All images in the system will be listed here for moderation.</p>
      </div>
    </div>
  </div>
);

const Settings: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6 text-base-100">System settings</h2>
    <div className="card bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
      <div className="card-body">
        <p className="text-base-200">System limits, configuration, and backup options coming soon.</p>
      </div>
    </div>
  </div>
);

export const AdminPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['dashboard', 'users', 'images', 'settings'].includes(path)) {
      setActiveTab(path);
    }
  }, [location]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: '👥', path: '/admin/users' },
    { id: 'images', label: 'Images', icon: '🖼️', path: '/admin/images' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-100">Admin panel</h1>
        <div className="badge badge-primary">Administrator</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
            <div className="card-body p-0">
              <ul className="menu menu-vertical w-full">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 ${
                        activeTab === item.id ? 'active' : ''
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card bg-white/10 shadow-glass rounded-2xl backdrop-blur border border-white/10">
            <div className="card-body">
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="images" element={<Images />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
