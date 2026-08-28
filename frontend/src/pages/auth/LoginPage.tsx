import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck, Shield, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      showToast('success', `Welcome back, ${res.user.full_name}!`);

      if (!res.user.has_profile && res.user.role === 'USER') {
        navigate('/onboarding');
        return;
      }

      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.user.role === 'EXPERT') {
        navigate('/expert');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">Sign In to NutriFit</h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your AI-generated nutritional and workout protocols
        </p>
      </div>

      {/* Quick Demo Fill Buttons */}
      <div className="mb-6 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
          ⚡ 1-Click Demo Accounts
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('user@demo.com', 'User@123')}
            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center transition"
          >
            <UserCheck className="w-4 h-4 mb-1" />
            <span>Demo User</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('expert@demo.com', 'Expert@123')}
            className="p-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl text-sky-300 text-xs font-semibold flex flex-col items-center justify-center transition"
          >
            <Stethoscope className="w-4 h-4 mb-1" />
            <span>Nutritionist</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@demo.com', 'Admin@123')}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-semibold flex flex-col items-center justify-center transition"
          >
            <Shield className="w-4 h-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@demo.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 transition outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-white placeholder-slate-600 transition outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition transform active:scale-[0.99] mt-2"
        >
          {isLoading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition">
          Create account
        </Link>
      </div>
    </div>
  );
};
