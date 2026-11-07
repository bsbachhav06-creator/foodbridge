import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/client';
import { VolunteerDashboardResponse } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import {
  Truck,
  Utensils,
  Scale,
  Leaf,
  CheckCircle2,
  Clock,
  QrCode,
  MapPin,
  ArrowRight,
  Building2,
  AlertCircle,
} from 'lucide-react';

export const VolunteerDashboardPage: React.FC = () => {
  const [data, setData] = useState<VolunteerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getVolunteer();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load volunteer dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading volunteer dashboard..." />;
  }

  const activeTask = data?.activeTask;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Volunteer Driver Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Accept food rescue tasks, verify pickups with QR codes, and deliver meals to local shelters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/volunteer/available"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
          >
            <Truck className="w-4 h-4" />
            Find Pickup Tasks
          </Link>
          <Link
            to="/volunteer/scan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition"
          >
            <QrCode className="w-4 h-4" />
            Scan QR
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Meals Transported"
          value={data ? data.totalMealsDelivered.toLocaleString() : '0'}
          subtitle="Delivered to hungry communities"
          icon={<Utensils className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Food Weight Saved"
          value={data ? `${data.totalWeightKgDelivered} kg` : '0 kg'}
          subtitle="Rescued from waste"
          icon={<Scale className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Estimated CO₂ Avoided"
          value={data ? `${data.estimatedCo2ReductionKg} kg` : '0 kg'}
          subtitle="2.5x weight ratio"
          icon={<Leaf className="w-6 h-6" />}
          color="amber"
          isEstimate={true}
        />
        <StatCard
          title="Deliveries Completed"
          value={data ? data.completedDeliveries : 0}
          subtitle={`${data?.activePickups || 0} tasks in progress`}
          icon={<Truck className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Active Pickup Task Highlight */}
      {activeTask ? (
        <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 rounded-2xl border-2 border-amber-300 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="animate-pulse flex h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Current In-Progress Task
                </span>
                <StatusBadge status={activeTask.status} />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeTask.donationTitle}
              </h2>
            </div>

            <Link
              to="/volunteer/scan"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 transition self-start sm:self-auto"
            >
              <QrCode className="w-4 h-4" />
              {activeTask.status === 'ACCEPTED' ? 'Scan Pickup QR Code' : 'Scan Delivery QR Code'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Pickup Point */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Step 1: Pickup from Donor Kitchen
              </span>
              <p className="font-bold text-slate-900 text-sm">{activeTask.donorName}</p>
              <p className="text-slate-600">{activeTask.pickupAddress}</p>
              {activeTask.donorPhone && <p className="text-slate-500">Contact: {activeTask.donorPhone}</p>}
              <div className="pt-2">
                <span className="font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  {activeTask.status === 'PICKED_UP' ? '✓ Picked Up' : 'Waiting for you to arrive and scan donor QR'}
                </span>
              </div>
            </div>

            {/* Delivery Point */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-600" />
                Step 2: Deliver to NGO Center
              </span>
              <p className="font-bold text-slate-900 text-sm">{activeTask.ngoName}</p>
              <p className="text-slate-600">{activeTask.deliveryAddress || 'Address on record'}</p>
              {activeTask.ngoPhone && <p className="text-slate-500">Contact: {activeTask.ngoPhone}</p>}
              <div className="pt-2">
                <span className="font-medium text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                  {activeTask.status === 'PICKED_UP' ? 'Head to NGO and scan delivery QR' : 'Deliver after pickup'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900">You currently have no active task</h3>
            <p className="text-xs text-slate-500">
              Browse claimed surplus food waiting for transport in your area. You can accept 1 task at a time.
            </p>
          </div>
          <Link
            to="/volunteer/available"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
          >
            Browse Available Tasks
          </Link>
        </div>
      )}
    </div>
  );
};
