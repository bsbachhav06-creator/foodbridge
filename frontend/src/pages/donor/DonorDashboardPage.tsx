import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, donationApi } from '../../api/client';
import { DonorDashboardResponse, DonationResponse } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PickupQrModal } from './PickupQrModal';
import {
  Utensils,
  PlusCircle,
  Scale,
  Leaf,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowRight,
  Eye,
  XCircle,
} from 'lucide-react';

export const DonorDashboardPage: React.FC = () => {
  const [data, setData] = useState<DonorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQrAssignmentId, setActiveQrAssignmentId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getDonor();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load donor dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCancelDonation = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await donationApi.cancel(id);
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel donation');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading donor dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Donor Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your kitchen surplus and track your social food impact.
          </p>
        </div>
        <Link
          to="/donor/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Surplus
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Meals Donated"
          value={data ? data.totalMealsDonated.toLocaleString() : '0'}
          subtitle="Delivered to community shelters"
          icon={<Utensils className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Surplus Weight Rescued"
          value={data ? `${data.totalWeightKgDonated} kg` : '0 kg'}
          subtitle="Saved from commercial waste"
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
          title="Active Listings"
          value={data ? data.activeDonations : 0}
          subtitle={`${data?.completedDonations || 0} completed donations`}
          icon={<Clock className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Food Donations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Track current status and volunteer pickups</p>
          </div>
          <Link
            to="/donor/my-donations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentDonations && data.recentDonations.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {data.recentDonations.map((d) => (
              <div
                key={d.id}
                className="p-5 sm:px-6 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={d.status} />
                    <CategoryBadge category={d.foodCategory} vegetarian={d.vegetarian} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{d.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      <strong className="text-slate-700">{d.numberOfServings}</strong> servings ({d.estimatedWeightKg} kg)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Expires: {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {d.ngoName && (
                      <>
                        <span>•</span>
                        <span className="text-sky-700 font-medium">Claimed by: {d.ngoName}</span>
                      </>
                    )}
                    {d.volunteerName && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-700 font-medium">Volunteer: {d.volunteerName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Show QR code if volunteer assigned */}
                  {(d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'CLAIMED') && d.assignmentId && (
                    <button
                      onClick={() => setActiveQrAssignmentId(d.assignmentId!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Show Pickup QR
                    </button>
                  )}

                  <Link
                    to={`/donor/donations/${d.id}`}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {(d.status === 'AVAILABLE' || d.status === 'CLAIMED') && (
                    <button
                      onClick={() => handleCancelDonation(d.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Cancel Donation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No donations posted yet"
            description="Have surplus cooked meals or bakery goods? Post them now to connect with local charities."
            actionText="Post Surplus Food"
            onAction={() => window.location.assign('/donor/create')}
          />
        )}
      </div>

      {/* Pickup QR Code Modal */}
      {activeQrAssignmentId && (
        <PickupQrModal
          assignmentId={activeQrAssignmentId}
          isOpen={true}
          onClose={() => setActiveQrAssignmentId(null)}
        />
      )}
    </div>
  );
};
