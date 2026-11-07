import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupApi } from '../../api/client';
import { PickupResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import {
  Truck,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AvailablePickupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<PickupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState<number>(15.0);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Volunteer default coordinates (Mumbai)
  const defaultLat = 19.0760;
  const defaultLng = 72.8777;

  const fetchPickups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pickupApi.getAvailable({
        latitude: defaultLat,
        longitude: defaultLng,
        radiusKm,
      });
      if (res.data.success) {
        setPickups(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch available pickups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [radiusKm]);

  const handleAccept = async (claimId: number) => {
    if (!window.confirm('Do you want to accept this food rescue transport task?')) return;

    setAcceptingId(claimId);
    setError(null);

    try {
      const res = await pickupApi.accept(claimId);
      if (res.data.success) {
        navigate('/volunteer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept task. You may already have an active task.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Available Pickup Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Claimed surplus food waiting for volunteer transport within {radiusKm} km.
          </p>
        </div>

        {/* Radius control */}
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200/90 rounded-xl shadow-sm self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Radius:
          </span>
          {[5, 10, 15, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                radiusKm === r
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Searching available pickup tasks..." />
      ) : pickups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pickups.map((p) => (
            <div
              key={p.claimId}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CategoryBadge category={p.foodCategory} />
                  {p.distanceKm !== undefined && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {p.distanceKm} km away
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{p.donationTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>{p.numberOfServings}</strong> servings ({p.estimatedWeightKg} kg)
                  </p>
                </div>

                {/* Pickup & Destination Details */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Origin */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">
                        Pickup From
                      </span>
                      <p className="font-semibold text-slate-800">{p.donorName}</p>
                      <p className="text-slate-500 line-clamp-1">{p.pickupAddress}</p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">
                        Deliver To
                      </span>
                      <p className="font-semibold text-slate-800">{p.ngoName}</p>
                      <p className="text-slate-500 line-clamp-1">{p.deliveryAddress || 'Address on record'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accept Task Button */}
              <button
                onClick={() => handleAccept(p.claimId)}
                disabled={acceptingId === p.claimId}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {acceptingId === p.claimId ? (
                  'Accepting Task...'
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    Accept Pickup Task
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No claimed donations awaiting volunteer pickup"
          description={`No pending pickup tasks within ${radiusKm} km. Try expanding the search radius.`}
          actionText="Search 30 km"
          onAction={() => setRadiusKm(30)}
        />
      )}
    </div>
  );
};
