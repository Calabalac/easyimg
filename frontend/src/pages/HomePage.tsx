import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Hero-блок */}
      <div className="hero min-h-[70vh] bg-gradient-to-br from-[#181a20] to-[#23272f] text-base-100">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 md:p-10">
            <h1 className="text-5xl font-bold mb-4">EasyImg — твой облачный фотохостинг</h1>
            <p className="mb-6 text-lg text-base-200">
              Быстрая загрузка, хранение и обмен изображениями. Прямые ссылки, приватность, тарифы для любого пользователя.
            </p>
            <div className="space-x-4 mb-6">
              {isAuthenticated ? (
                <>
                  <Link to="/upload" className="btn btn-secondary btn-lg">Загрузить</Link>
                  <Link to="/images" className="btn btn-outline btn-lg">Мои изображения</Link>
                </>
              ) : (
                <>
                  <Link to="/auth/register" className="btn btn-primary btn-lg">Начать бесплатно</Link>
                  <Link to="/auth/login" className="btn btn-outline btn-lg">Войти</Link>
                </>
              )}
            </div>
            <div className="flex gap-4 mt-8 flex-wrap">
              <div className="stat bg-base-100 text-primary-content shadow-md rounded-xl">
                <div className="stat-title">Загружено</div>
                <div className="stat-value">1.2K+</div>
              </div>
              <div className="stat bg-base-100 text-primary-content shadow-md rounded-xl">
                <div className="stat-title">Пользователей</div>
                <div className="stat-value">150+</div>
              </div>
              <div className="stat bg-base-100 text-primary-content shadow-md rounded-xl">
                <div className="stat-title">Аптайм</div>
                <div className="stat-value">99.9%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Секция преимуществ */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-2 md:px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-base-100">Почему выбирают EasyImg?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="card-body items-center text-center">
                <span className="badge badge-primary mb-2">Быстро</span>
                <h3 className="card-title text-base-100">Молниеносная загрузка</h3>
                <p className="text-base-200">Загружайте фото за секунды, без лишних кликов и ожидания.</p>
              </div>
            </div>
            <div className="card bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="card-body items-center text-center">
                <span className="badge badge-secondary mb-2">Безопасно</span>
                <h3 className="card-title text-base-100">Приватность и контроль</h3>
                <p className="text-base-200">Ваши изображения доступны только вам или по ссылке — никаких утечек.</p>
              </div>
            </div>
            <div className="card bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="card-body items-center text-center">
                <span className="badge badge-accent mb-2">Гибко</span>
                <h3 className="card-title text-base-100">Тарифы для всех</h3>
                <p className="text-base-200">Бесплатный старт и расширенные возможности для профи и бизнеса.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12 bg-white/10 backdrop-blur-md border-t border-white/20 text-base-100">
        <div className="container mx-auto px-2 md:px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы попробовать?</h2>
          <p className="mb-6 text-base-200">Зарегистрируйтесь бесплатно и начните делиться изображениями уже сейчас!</p>
          <Link to="/auth/register" className="btn btn-lg btn-primary">Создать аккаунт</Link>
        </div>
      </section>

      {/* Футер */}
      <footer className="footer p-10 bg-white/10 backdrop-blur-md border-t border-white/20 text-base-200 mt-8">
        <div>
          <span className="footer-title text-base-100">EasyImg</span>
          <Link to="/">Главная</Link>
          <Link to="/pricing">Тарифы</Link>
          <Link to="/upload">Загрузить</Link>
          <Link to="/images">Галерея</Link>
          <Link to="/profile">Профиль</Link>
          <Link to="/subscription">Подписка</Link>
          <Link to="/admin">Админка</Link>
          <Link to="/auth/login">Вход</Link>
          <Link to="/auth/register">Регистрация</Link>
          <Link to="/404">404</Link>
        </div>
        <div>
          <span className="footer-title text-base-100">О проекте</span>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:support@easyimg.com">Поддержка</a>
        </div>
        <div>
          <span className="footer-title text-base-100">Контакты</span>
          <a>Telegram</a>
        </div>
      </footer>
    </>
  );
}; 