import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { UserDto, Role } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Users, Search, Shield, Ban, CheckCircle, Mail, Phone, Building2 } from 'lucide-react';

export const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserDto) => {
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} user "${user.fullName}"?`)) return;

    setProcessingId(user.id);
    try {
      const res = await adminApi.toggleUserStatus(user.id, newStatus);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organization?.organizationName &&
        u.organization.organizationName.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage donors, NGOs, volunteer drivers, and administrators.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, org..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.fullName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{u.email}</p>
                        {u.phone && <p className="text-slate-400 text-[11px]">{u.phone}</p>}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-800">
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {u.organization ? (
                        <div>
                          <p className="font-bold text-slate-800">{u.organization.organizationName}</p>
                          <p className="text-slate-500 text-[11px]">{u.organization.organizationType} • {u.organization.city}</p>
                          {u.role === 'NGO' && (
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded ${
                                u.organization.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {u.organization.verificationStatus}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Individual Account</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <Ban className="w-3.5 h-3.5" />
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={processingId === u.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            u.active
                              ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {u.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
