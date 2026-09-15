import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CMSUser, UserRole } from '../../types';
import { Users, UserPlus, Shield, KeyRound, Check, RefreshCw } from 'lucide-react';

export const UsersModule: React.FC = () => {
  const { users, addUser, updateUser, currentUser } = useCMS();
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState<Partial<CMSUser>>({
    name: '',
    email: '',
    role: 'receptionist',
    status: 'active',
    phone: '+923280145670'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    addUser({
      name: newUser.name,
      email: newUser.email,
      role: (newUser.role as UserRole) || 'receptionist',
      status: 'active',
      phone: newUser.phone || '+923280145670',
      lastLogin: 'Never'
    });
    setIsAdding(false);
    setNewUser({ name: '', email: '', role: 'receptionist', status: 'active', phone: '+923280145670' });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase">Super Admin</span>;
      case 'admin':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>;
      case 'receptionist':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase">Receptionist</span>;
      case 'editor':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase">Content Editor</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Quick Role Simulator */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2097A2]" />
              Staff Accounts & Role-Based Access Control (RBAC)
            </h2>
            <p className="text-sm text-slate-600">
              Manage clinical staff credentials and role permissions for Super Admin, Admin, Receptionist, and Content Editor.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-[#2097A2] hover:bg-[#27BAC8] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" /> Add Staff User
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {isAdding && (
        <form onSubmit={handleAddUser} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Register New Clinical Staff Member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Staff Name *</label>
              <input
                type="text"
                required
                value={newUser.name || ''}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Login Email Address *</label>
              <input
                type="email"
                required
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role Permission Level *</label>
              <select
                value={newUser.role || 'receptionist'}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="super_admin">Super Admin (Full System Control)</option>
                <option value="admin">Admin (CMS & Appointments)</option>
                <option value="receptionist">Receptionist (Appointments, Contacts & Intake Queue)</option>
                <option value="editor">Content Editor (Medical Content & Articles)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff Contact Phone</label>
              <input
                type="text"
                value={newUser.phone || ''}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2097A2] text-white font-semibold rounded-lg hover:bg-[#27BAC8]"
            >
              Create Staff Account
            </button>
          </div>
        </form>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="p-3">Staff Name</th>
              <th className="p-3">Login Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Contact</th>
              <th className="p-3 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="p-3 font-bold text-slate-900">{u.name}</td>
                <td className="p-3 font-mono text-slate-700">{u.email}</td>
                <td className="p-3">{getRoleBadge(u.role)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-slate-600">{u.phone || '—'}</td>
                <td className="p-3 text-right text-slate-400 font-mono">{u.lastLogin || 'Recent'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
