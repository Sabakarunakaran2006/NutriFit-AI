import React, { useEffect, useState } from 'react';
import { Users, Search, UserCheck, Shield, Stethoscope, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedExpertId, setSelectedExpertId] = useState<number | null>(null);

  const { showToast } = useNotification();

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers(roleFilter || undefined);
      setUsers(data);
    } catch (e) {
      showToast('error', 'Failed to load user roster');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await adminService.updateUserStatus(userId, !currentStatus);
      showToast('success', `User account ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadUsers();
    } catch (e: any) {
      showToast('error', e.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showToast('success', `User role updated to ${newRole}`);
      loadUsers();
    } catch (e: any) {
      showToast('error', e.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleAssignExpert = async () => {
    if (!selectedUser || !selectedExpertId) return;
    try {
      await adminService.assignExpert(selectedExpertId, selectedUser.id);
      showToast('success', `Client assigned to expert!`);
      setAssignModalOpen(false);
      loadUsers();
    } catch (e: any) {
      showToast('error', e.response?.data?.detail || 'Failed to assign expert');
    }
  };

  const experts = users.filter((u) => u.role === 'EXPERT' || u.role === 'ADMIN');
  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading user governance database..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">User & Role Management</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Control authentication status, grant permissions, and configure expert client assignments.
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="">All Roles</option>
              <option value="USER">Clients (USER)</option>
              <option value="EXPERT">Experts (EXPERT)</option>
              <option value="ADMIN">Administrators (ADMIN)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Goal & Weight</th>
                <th className="py-3 px-3">Assigned Expert</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/60 transition">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white text-sm">{u.full_name}</div>
                    <div className="text-slate-500 text-[11px]">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-emerald-500"
                    >
                      <option value="USER">USER</option>
                      <option value="EXPERT">EXPERT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-200 capitalize">{u.goal?.replace('_', ' ')}</div>
                    <div className="text-slate-400 text-[11px]">
                      {u.current_weight ? `${u.current_weight} kg` : 'Profile pending'}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    {u.assigned_expert ? (
                      <span className="font-semibold text-sky-400">{u.assigned_expert}</span>
                    ) : u.role === 'USER' ? (
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setAssignModalOpen(true);
                        }}
                        className="text-xs text-slate-500 hover:text-sky-400 underline font-semibold"
                      >
                        Assign Expert
                      </button>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {u.is_active ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px]">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        u.is_active
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Expert Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Nutritionist for ${selectedUser?.full_name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select a certified nutrition expert to oversee {selectedUser?.full_name}'s diet and workout adaptation.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Expert</label>
            <select
              value={selectedExpertId || ''}
              onChange={(e) => setSelectedExpertId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="">-- Choose Expert --</option>
              {experts.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.full_name} ({exp.email})
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={!selectedExpertId}
            onClick={handleAssignExpert}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
          >
            <UserCheck className="w-4 h-4" />
            <span>Confirm Expert Assignment</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
