import React, { useState, useEffect } from 'react';
import { claimApi } from '../../api/client';
import { ClaimResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { DeliveryQrModal } from './DeliveryQrModal';
import { QrCode, Clock, MapPin, XCircle, Truck, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClaimedDonationsPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeliveryQrId, setActiveDeliveryQrId] = useState<number | null>(null);

  const fetchClaims = async () => {
    try {
      const res = await claimApi.getMy();
      if (res.data.success) {
        setClaims(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch claims', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleCancelClaim = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this claim?')) return;
    try {
      await claimApi.cancel(id);
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel claim');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Claimed Food Donations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track volunteer delivery progress and generate delivery verification codes.
          </p>
        </div>
        <Link
          to="/ngo/nearby"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <MapPin className="w-4 h-4" />
          Find More Food
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading claims..." />
      ) : claims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={c.status} />
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.claimedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <CategoryBadge category={c.foodCategory} />
                  <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                    {c.donationTitle}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Meals / Weight:</span>
                    <span className="font-semibold text-slate-800">
                      {c.numberOfServings} servings ({c.estimatedWeightKg} kg)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pickup Location:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">
                      {c.pickupAddress}
                    </span>
                  </div>
                  {c.volunteerName ? (
                    <div className="flex justify-between items-center text-indigo-700">
                      <span className="text-slate-400">Volunteer:</span>
                      <span className="font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {c.volunteerName}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 italic">
                      Awaiting volunteer pickup acceptance
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {c.assignmentId && c.status === 'ACTIVE' ? (
                  <button
                    onClick={() => setActiveDeliveryQrId(c.assignmentId!)}
                    className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    Show Delivery QR
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    {c.status === 'COMPLETED' ? 'Delivered & Completed' : 'Pending volunteer'}
                  </span>
                )}

                {c.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCancelClaim(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
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
          title="No food claimed yet"
          description="Browse nearby surplus meals posted by verified kitchens and claim food for your shelter."
          actionText="Browse Available Food"
          onAction={() => window.location.assign('/ngo/nearby')}
        />
      )}

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
