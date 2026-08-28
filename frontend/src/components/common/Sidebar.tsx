import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  LineChart,
  Camera,
  MessageSquareHeart,
  ShoppingCart,
  User,
  Settings,
  Users,
  Brain,
  Database,
  Award,
  LogOut,
  Sparkles,
  Layers,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const userNav: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Health Profile', icon: User },
    { to: '/diet-plan', label: "Today's Diet Plan", icon: Utensils },
    { to: '/workout-plan', label: 'Workout Split', icon: Dumbbell },
    { to: '/meal-tracker', label: 'Meal Tracker', icon: Layers },
    { to: '/workout-tracker', label: 'Workout Logger', icon: Award },
    { to: '/progress', label: 'Progress & Analytics', icon: LineChart },
    { to: '/food-scanner', label: 'AI Food Scanner', icon: Camera, badge: 'AI' },
    { to: '/feedback', label: 'Adaptive Feedback', icon: MessageSquareHeart, badge: 'Adaptive' },
    { to: '/grocery-list', label: 'Weekly Grocery List', icon: ShoppingCart },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const expertNav: NavItem[] = [
    { to: '/expert', label: 'Expert Dashboard', icon: LayoutDashboard },
    { to: '/expert/users', label: 'Assigned Clients', icon: Users },
  ];

  const adminNav: NavItem[] = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User & Expert Management', icon: Users },
    { to: '/admin/models', label: 'ML Model Management', icon: Brain, badge: 'ML' },
    { to: '/admin/datasets', label: 'Dataset Registry', icon: Database },
  ];

  const navItems = user.role === 'ADMIN' ? adminNav : user.role === 'EXPERT' ? expertNav : userNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center">
                NutriFit<span className="text-emerald-400 ml-0.5 font-bold">.AI</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                {user.role} PORTAL
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                {user.full_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
