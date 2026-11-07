import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, dashboardApi } from '../../api/client';
import { AdminAnalyticsResponse, ImpactStatsResponse, UserDto } from '../../types';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  ShieldCheck,
  FileCheck2,
  Users,
  Utensils,
  Leaf,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [pendingNgos, setPendingNgos] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [analyticsRes, pendingRes] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getPendingNgos(),
        ]);
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
        if (pendingRes.data.success) {
          setPendingNgos(pendingRes.data.data);
        }
      } catch (e) {
        console.error('Failed to load admin data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading || !analytics) {
    return <LoadingSpinner message="Loading administrative dashboard..." />;
  }

  const impact = analytics.impactStats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Oversee user verifications, NGO shelter accreditations, and platform-wide food logistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/ngos"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            Review NGOs ({pendingNgos.length})
          </Link>
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Full Analytics
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Users"
          value={analytics.totalUsers}
          subtitle="Donors, NGOs, volunteers"
          icon={<Users className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Pending NGO Approvals"
          value={analytics.pendingNgoCount}
          subtitle="Awaiting credential review"
          icon={<FileCheck2 className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Total Meals Saved"
          value={impact.mealsSaved.toLocaleString()}
          subtitle="Verified delivered food"
          icon={<Utensils className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Estimated CO₂ Reduced"
          value={`${impact.estimatedCo2ReductionKg.toLocaleString()} kg`}
          subtitle="2.5x ratio estimate"
          icon={<Leaf className="w-6 h-6" />}
          color="blue"
          isEstimate={true}
        />
      </div>

      {/* Pending NGO Review Banner */}
      {pendingNgos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {pendingNgos.length} NGO organization{pendingNgos.length > 1 ? 's' : ''} awaiting approval
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Review operating hours, address, and charity registration before granting claim permissions.
              </p>
            </div>
          </div>
          <Link
            to="/admin/ngos"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
          >
            Review Applications
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/ngos"
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
            NGO Verification Portal
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review charity addresses, operating hours, and approve or reject access to surplus donations.
          </p>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-1">
            Manage NGO Approvals <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
            User Directory & Access
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Search all registered accounts across roles. Activate or deactivate accounts to prevent misuse.
          </p>
          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-1">
            Browse Directory <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
            Impact & Food Trends
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Visual graphs of categories, geographical rescue zones, and CO₂ offset environmental reports.
          </p>
          <span className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-1">
            View Analytics <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
};
