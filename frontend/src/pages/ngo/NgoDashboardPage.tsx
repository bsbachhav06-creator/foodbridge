import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, claimApi } from '../../api/client';
import { NgoDashboardResponse, ClaimResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { DeliveryQrModal } from './DeliveryQrModal';
import {
  Building2,
  MapPin,
  Utensils,
  Scale,
  Leaf,
  Clock,
  QrCode,
  ArrowRight,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const NgoDashboardPage: React.FC = () => {
  const { isNgoVerified, user } = useAuth();
  const [data, setData] = useState<NgoDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDeliveryQrId, setActiveDeliveryQrId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getNgo();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load NGO dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCancelClaim = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this food claim?')) return;
    try {
      await claimApi.cancel(id);
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel claim');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading NGO dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Verification Warning if Pending */}
      {!isNgoVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <p className="font-bold">NGO Account Verification Pending</p>
            <p>
              Your organization (<span className="font-semibold">{user?.organization?.organizationName}</span>) is awaiting platform administrator approval. You can browse nearby surplus food, but cannot claim donations until verified.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NGO Shelter Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse nearby donations, track inbound volunteer deliveries, and show receipt QR codes.
          </p>
        </div>
        <Link
          to="/ngo/nearby"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <MapPin className="w-4 h-4" />
          Find Surplus Food
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Meals Received"
          value={data ? data.totalMealsReceived.toLocaleString() : '0'}
          subtitle="Served to beneficiaries"
          icon={<Utensils className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Surplus Weight Rescued"
          value={data ? `${data.totalWeightKgReceived} kg` : '0 kg'}
          subtitle="Rescued food redistributed"
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
          title="Active Claims"
          value={data ? data.activeClaims : 0}
          subtitle={`${data?.receivedDonations || 0} completed receipts`}
          icon={<Building2 className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Recent Claims List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Food Claims</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage active claims and generate delivery verification codes</p>
          </div>
          <Link
            to="/ngo/claims"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentClaims && data.recentClaims.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {data.recentClaims.map((c) => (
              <div
                key={c.id}
                className="p-5 sm:px-6 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={c.status} />
                    <CategoryBadge category={c.foodCategory} />
                    {c.assignmentStatus && (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Transport: {c.assignmentStatus.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{c.donationTitle}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      <strong className="text-slate-700">{c.numberOfServings}</strong> servings ({c.estimatedWeightKg} kg)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Claimed: {new Date(c.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {c.volunteerName && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-700 font-medium">Volunteer: {c.volunteerName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Show delivery QR if volunteer assigned */}
                  {c.assignmentId && c.status === 'ACTIVE' && (
                    <button
                      onClick={() => setActiveDeliveryQrId(c.assignmentId!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Show Delivery QR
                    </button>
                  )}

                  {c.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCancelClaim(c.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Cancel Claim"
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
            title="No active food claims"
            description="Explore surplus meals available from nearby restaurants and caterers."
            actionText="Find Surplus Food"
            onAction={() => window.location.assign('/ngo/nearby')}
          />
        )}
      </div>

      {activeDeliveryQrId && (
        <DeliveryQrModal
          assignmentId={activeDeliveryQrId}
          isOpen={true}
          onClose={() => setActiveDeliveryQrId(null)}
        />
      )}
    </div>
  );
};
