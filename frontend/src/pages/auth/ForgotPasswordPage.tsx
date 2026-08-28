import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      if (res.demo_reset_token) {
        setToken(res.demo_reset_token);
      }
    } catch (err) {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered email to receive a password reset token
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 mb-2" />
            <h4 className="font-bold text-sm text-white">Reset Token Generated</h4>
            <p className="text-xs text-slate-300 mt-1">
              For testing convenience, here is your generated reset token:
            </p>
            <code className="mt-2 px-3 py-1 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg border border-emerald-500/30">
              {token || 'RESET-2025-DEMO-TOKEN'}
            </code>
          </div>

          <button
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${token || 'RESET-2025-DEMO-TOKEN'}`)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2"
          >
            <span>Proceed to Reset</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950"
          >
            {isLoading ? <span>Processing...</span> : <span>Send Reset Instructions</span>}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center space-x-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
