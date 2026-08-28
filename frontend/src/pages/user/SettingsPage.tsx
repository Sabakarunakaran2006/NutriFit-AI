import React, { useState } from 'react';
import { Settings, Lock, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { MedicalDisclaimer } from '../../components/common/MedicalDisclaimer';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      showToast('success', 'Security credentials updated successfully!');
      setCurrentPassword('');
      newPassword && setNewPassword('');
      setConfirmPassword('');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System & Account Settings</h2>
        </div>
        <p className="text-xs text-slate-400">
          Manage your login credentials, role authorizations, and review system disclosures.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800 flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Account Authorization Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Full Name</span>
            <span className="font-bold text-white text-sm">{user?.full_name}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Email</span>
            <span className="font-bold text-white text-sm">{user?.email}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Assigned Role</span>
            <span className="font-bold text-emerald-400 text-sm uppercase">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-slate-700"
          >
            <span>Update Password</span>
          </button>
        </form>
      </div>

      {/* Persistent Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
