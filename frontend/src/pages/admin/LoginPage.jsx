import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/admin';

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-500" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-500" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-xl">II</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Infinity Investment Property Solutions</h1>
          <p className="text-primary-400 text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-primary-800 border border-primary-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-primary-400" />
            <span className="text-primary-300 text-sm font-medium">Sign in to continue</span>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="field">
              <label className="label text-primary-300">Email Address</label>
              <input
                className="input bg-primary-700 border-primary-600 text-white placeholder-primary-500 focus:ring-accent-400"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@infinityips.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label className="label text-primary-300">Password</label>
              <div className="relative">
                <input
                  className="input bg-primary-700 border-primary-600 text-white placeholder-primary-500 focus:ring-accent-400 pr-10"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-200"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-primary-600 text-xs mt-6">
          Infinity Investment Property Solutions — Private Use Only
        </p>
      </div>
    </div>
  );
}
