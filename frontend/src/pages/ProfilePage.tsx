import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Реализовать обновление профиля через API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      
      setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при обновлении профиля' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Пароль должен содержать минимум 6 символов' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // TODO: Реализовать смену пароля через API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      
      setMessage({ type: 'success', text: 'Пароль успешно изменен!' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при смене пароля' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="avatar">
                  <div className="w-24 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                
                <h2 className="card-title justify-center mt-4">{user?.email}</h2>
                
                <div className="space-y-2 mt-4">
                  <div className="badge badge-primary">{user?.role}</div>
                  <div className="text-sm text-base-content/60">
                    Регистрация: {user?.created_at ? formatDate(user.created_at) : 'Неизвестно'}
                  </div>
                  <div className={`badge ${user?.is_active ? 'badge-success' : 'badge-error'}`}>
                    {user?.is_active ? 'Активен' : 'Заблокирован'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title">Основная информация</h3>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Отменить' : 'Редактировать'}
                  </button>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end mt-4">
                      <button 
                        type="submit" 
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        disabled={loading}
                      >
                        Сохранить
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Смена пароля</h3>
                
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Текущий пароль</span>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="input input-bordered"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Новый пароль</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        className="input input-bordered"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Подтвердите новый пароль</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="input input-bordered"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${loading ? 'loading' : ''}`}
                      disabled={loading}
                    >
                      Изменить пароль
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Account Stats */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Статистика аккаунта</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Загружено изображений</div>
                    <div className="stat-value text-primary">42</div>
                    <div className="stat-desc">за все время</div>
                  </div>
                  
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Использовано места</div>
                    <div className="stat-value text-secondary">8.5 MB</div>
                    <div className="stat-desc">из 100 MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
