import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="hero min-h-[80vh]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="text-9xl font-bold text-primary mb-4">404</div>
          <h1 className="text-5xl font-bold mb-4">Страница не найдена</h1>
          <p className="py-6 text-base-content/70">
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </p>
          <div className="space-x-4">
            <Link to="/" className="btn btn-primary">
              На главную
            </Link>
            <Link to="/images" className="btn btn-outline">
              Мои изображения
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
