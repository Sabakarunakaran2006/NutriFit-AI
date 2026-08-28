import React from 'react';
import { Menu, Bell, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 lg:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global search or status badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium text-emerald-400">ML Engine Online</span>
          <span className="text-slate-500">|</span>
          <span>GB Regressor & K-Means v2.1</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Role badge */}
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
            user.role === 'ADMIN'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : user.role === 'EXPERT'
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {user.role}
        </span>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center space-x-2 p-1.5 pl-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition text-xs font-semibold text-slate-200"
        >
          <span>{user.full_name.split(' ')[0]}</span>
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </header>
  );
};
