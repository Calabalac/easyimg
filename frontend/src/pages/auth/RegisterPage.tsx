import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-transparent">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-glass backdrop-blur-lg bg-white/10 border border-white/15">
        <h1 className="text-3xl font-bold text-base-100 mb-6 text-center tracking-widest">Sign up for EasyImg</h1>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-base-200 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="input input-bordered w-full bg-base-200/60 border-white/20 text-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-base-200 mb-2" htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              className="input input-bordered w-full bg-base-200/60 border-white/20 text-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full text-base-100 font-bold py-2 rounded-xl ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <div className="text-center mt-6 text-base-200">
          <span>Already have an account? </span>
          <Link to="/auth/login" className="link link-primary">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
