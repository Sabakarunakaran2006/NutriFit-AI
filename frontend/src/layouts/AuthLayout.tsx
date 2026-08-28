import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Brand Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white flex items-center">
              NutriFit<span className="text-emerald-400 ml-0.5">.AI</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
              Personalized Healthcare & Fitness
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Machine Learning Platform</span>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md mx-auto my-8">
        <Outlet />
      </div>

      {/* Auth Footer with Medical Notice */}
      <div className="max-w-md w-full mx-auto">
        <MedicalDisclaimer compact={true} />
      </div>
    </div>
  );
};
