import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

interface Subscription {
  id: string;
  plan: Plan;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage: {
    images_uploaded: number;
    images_limit: number;
    storage_used: number;
    storage_limit: number;
  };
}

export const SubscriptionPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Загрузить данные подписки из API
    // Пока заглушка
    setTimeout(() => {
      const mockSubscription: Subscription = {
        id: '1',
        plan: {
          id: 'free',
          name: 'Free',
          description: 'Бесплатный план',
          price: 0,
          duration_days: 30,
          features: ['10 изображений в месяц', 'Базовая обработка'],
          is_active: true
        },
        start_date: '2025-06-01T00:00:00Z',
        end_date: '2025-07-01T00:00:00Z',
        is_active: true,
        usage: {
          images_uploaded: 7,
          images_limit: 10,
          storage_used: 15728640, // 15 MB
          storage_limit: 104857600 // 100 MB
        }
      };

      const mockPlans: Plan[] = [
        {
          id: 'classic',
          name: 'Classic',
          description: 'Для активных пользователей',
          price: 490,
          duration_days: 30,
          features: ['100 изображений в месяц', 'Расширенная обработка', 'HD качество'],
          is_active: true
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Для профессионалов',
          price: 990,
          duration_days: 30,
          features: ['500 изображений в месяц', 'Профессиональная обработка', '4K качество'],
          is_active: true
        }
      ];

      setSubscription(mockSubscription);
      setAvailablePlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    
    try {
      // TODO: Реализовать смену плана через API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Имитация успешной смены плана
      alert('План успешно изменен!');
    } catch (error) {
      alert('Ошибка при смене плана');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Управление подпиской</h1>

        {subscription ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Subscription */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Plan */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="card-title text-2xl">{subscription.plan.name}</h2>
                      <p className="text-base-content/70">{subscription.plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {subscription.plan.price === 0 ? 'Бесплатно' : `₽${subscription.plan.price}`}
                      </div>
                      {subscription.plan.price > 0 && (
                        <div className="text-sm text-base-content/60">в месяц</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {subscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-base-content/60">
                    <span>Действует с {formatDate(subscription.start_date)}</span>
                    <span>До {formatDate(subscription.end_date)}</span>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title mb-4">Использование ресурсов</h3>
                  
                  <div className="space-y-4">
                    {/* Images Usage */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Изображения</span>
                        <span className="text-sm">
                          {subscription.usage.images_uploaded} из {subscription.usage.images_limit}
                        </span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full" 
                        value={getUsagePercentage(subscription.usage.images_uploaded, subscription.usage.images_limit)} 
                        max="100"
                      ></progress>
                    </div>

                    {/* Storage Usage */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Хранилище</span>
                        <span className="text-sm">
                          {formatFileSize(subscription.usage.storage_used)} из {formatFileSize(subscription.usage.storage_limit)}
                        </span>
                      </div>
                      <progress 
                        className="progress progress-secondary w-full" 
                        value={getUsagePercentage(subscription.usage.storage_used, subscription.usage.storage_limit)} 
                        max="100"
                      ></progress>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title mb-4">Улучшить план</h3>
                  
                  {availablePlans.length > 0 ? (
                    <div className="space-y-4">
                      {availablePlans.map((plan) => (
                        <div key={plan.id} className="border border-base-300 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold">{plan.name}</h4>
                            <div className="text-lg font-bold">₽{plan.price}</div>
                          </div>
                          <p className="text-sm text-base-content/70 mb-3">{plan.description}</p>
                          
                          <button
                            className={`btn btn-primary btn-sm w-full ${upgrading === plan.id ? 'loading' : ''}`}
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={upgrading !== null}
                          >
                            {upgrading === plan.id ? 'Обновление...' : 'Выбрать план'}
                          </button>
                        </div>
                      ))}
                      
                      <div className="divider">или</div>
                      
                      <Link to="/pricing" className="btn btn-outline btn-sm w-full">
                        Посмотреть все планы
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-base-content/70 mb-4">
                        У вас максимальный план!
                      </p>
                      <Link to="/pricing" className="btn btn-outline btn-sm">
                        Посмотреть планы
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Нет активной подписки</h2>
            <p className="text-base-content/70 mb-6">
              Выберите подходящий план для начала работы
            </p>
            <Link to="/pricing" className="btn btn-primary">
              Выбрать план
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
