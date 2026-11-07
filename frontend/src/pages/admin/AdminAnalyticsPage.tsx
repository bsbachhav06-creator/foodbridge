import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { AdminAnalyticsResponse } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, Leaf, Utensils, Scale, Sparkles, ShieldCheck } from 'lucide-react';

const COLORS = ['#10b981', '#0284c7', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminApi.getAnalytics();
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return <LoadingSpinner message="Calculating analytics and chart distributions..." />;
  }

  // Format category data
  const categoryData = Object.entries(analytics.categoryBreakdown || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    count: value,
  }));

  // Format status data
  const statusData = Object.entries(analytics.statusBreakdown || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    count: value,
  }));

  // Format monthly trend data
  const trendData = Object.entries(analytics.monthlyTrend || {}).map(([key, value]) => ({
    month: key,
    donations: value,
  }));

  // Format city data
  const cityData = Object.entries(analytics.cityBreakdown || {}).map(([key, value]) => ({
    city: key,
    donations: value,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Social & Environmental Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quantitative redistribution metrics, carbon offset estimates, and category distributions.
        </p>
      </div>

      {/* Formula Documentation Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl shadow-sm border border-emerald-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Documented Impact Calculation Methodology
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Meals Saved and Food Weight (kg) represent the absolute sum of verified <span className="text-white font-semibold">DELIVERED</span> donations. 
          CO₂ emissions avoidance is computed using the global standard demo formula:
        </p>
        <div className="p-3 bg-black/40 rounded-xl font-mono text-xs text-emerald-300 inline-block border border-emerald-900/80">
          estimatedCo2ReductionKg = foodSavedKg * 2.5
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Surplus Volume by Food Category
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Donation Lifecycle Status Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Monthly Donation Redistribution Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="donations"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic City Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Donations by Regional Municipalities
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="donations" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
