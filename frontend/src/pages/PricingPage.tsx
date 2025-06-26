import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // USD plans only
    const mockPlans: Plan[] = [
      {
        id: 'free',
        name: 'Free',
        description: 'For beginners',
        price: 0,
        duration_days: 30,
        features: [
          '10 images per month',
          'Basic processing',
          'Standard quality',
          'Community support'
        ],
        is_active: true
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'For regular users',
        price: 5,
        duration_days: 30,
        features: [
          '100 images per month',
          'Advanced processing',
          'HD quality',
          'Email support',
          'Priority upload'
        ],
        is_active: true
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For professionals',
        price: 10,
        duration_days: 30,
        features: [
          '500 images per month',
          'Pro processing',
          '4K quality',
          'Priority support',
          'API access',
          'Bulk operations'
        ],
        is_active: true
      },
      {
        id: 'max',
        name: 'MAX',
        description: 'Unlimited plan',
        price: 20,
        duration_days: 30,
        features: [
          'Unlimited images',
          'All processing features',
          '8K quality',
          '24/7 support',
          'Extended API',
          'White label',
          'Personal manager'
        ],
        is_active: true
      }
    ];
    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-base-100">Choose your plan</h1>
        <p className="text-lg text-base-200 max-w-2xl mx-auto">
          Professional tools for image management. Pick the plan that fits you best.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300`}
          >
            <div className="card-body">
              <h2 className="card-title justify-center text-2xl font-bold text-base-100">
                {plan.name}
              </h2>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-base-100">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </div>
                {plan.price > 0 && (
                  <div className="text-sm text-base-200">per month</div>
                )}
              </div>
              <p className="text-center text-base-200 mb-4">
                {plan.description}
              </p>
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-base-100">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="card-actions justify-center">
                {isAuthenticated ? (
                  <button className={`btn btn-primary btn-wide`}>
                    {plan.price === 0 ? 'Current plan' : 'Choose plan'}
                  </button>
                ) : (
                  <Link 
                    to="/auth/register" 
                    className={`btn btn-primary btn-wide`}
                  >
                    Get started
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <div className="card bg-white/10 backdrop-blur-md border border-white/20 shadow-lg max-w-2xl mx-auto">
          <div className="card-body">
            <h3 className="card-title justify-center text-base-100">Need a custom plan?</h3>
            <p className="text-center text-base-200">
              Contact us to discuss enterprise solutions and special terms.
            </p>
            <div className="card-actions justify-center">
              <button className="btn btn-outline btn-primary">Contact us</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
