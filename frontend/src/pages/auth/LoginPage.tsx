import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login error');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-transparent">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-glass backdrop-blur-lg bg-white/10 border border-white/15">
        <h1 className="text-3xl font-bold text-base-100 mb-6 text-center tracking-widest">Sign in to EasyImg</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error text-sm py-2 px-4 rounded-xl">{error}</div>
          )}
          <div>
            <label className="block text-base-200 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              className="input input-bordered w-full bg-base-200/60 border-white/20 text-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-base-200 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="input input-bordered w-full bg-base-200/60 border-white/20 text-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full text-base-100 font-bold py-2 rounded-xl ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="text-center mt-6 text-base-200">
          <span>Don't have an account? </span>
          <Link to="/auth/register" className="link link-primary">Sign up</Link>
        </div>
      </div>
    </div>
  );
}; 