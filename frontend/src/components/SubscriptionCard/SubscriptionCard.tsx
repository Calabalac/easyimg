import React from 'react';

// TODO: реализовать отображение информации о тарифе, кнопки выбора, стилизацию и обработку событий
export interface SubscriptionCardProps {
  title: string;
  price: string;
  features: string[];
  isActive?: boolean;
  onSelect?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ title, price, features, isActive, onSelect }) => {
  return (
    <div className={`border rounded p-4 shadow-sm ${isActive ? 'border-blue-500' : 'border-gray-300'}`}>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div className="text-2xl font-semibold mb-2">{price}</div>
      <ul className="mb-4 list-disc list-inside">
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <button
        className={`btn ${isActive ? 'btn-primary' : 'btn-outline'} w-full`}
        onClick={onSelect}
      >
        {isActive ? 'Текущий тариф' : 'Выбрать'}
      </button>
    </div>
  );
};

export default SubscriptionCard;
