import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickupApi } from '../../api/client';
import { PickupResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Truck, MapPin, Building2, QrCode, Clock, CheckCircle2 } from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<PickupResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await pickupApi.getMy();
        if (res.data.success) {
          setTasks(res.data.data);
        }
      } catch (e) {
        console.error('Failed to fetch volunteer tasks', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Pickup & Delivery Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            History of accepted transport missions and delivery confirmations.
          </p>
        </div>

        <Link
          to="/volunteer/scan"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          Open QR Scanner
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your tasks..." />
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={t.status} />
                  <span className="text-[11px] text-slate-400">
                    {t.acceptedAt ? new Date(t.acceptedAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div>
                  <CategoryBadge category={t.foodCategory} />
                  <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                    {t.donationTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>{t.numberOfServings}</strong> servings ({t.estimatedWeightKg} kg)
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">From Donor</span>
                      <p className="font-semibold text-slate-800">{t.donorName}</p>
                      <p className="text-slate-500 line-clamp-1">{t.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">To Shelter</span>
                      <p className="font-semibold text-slate-800">{t.ngoName}</p>
                      <p className="text-slate-500 line-clamp-1">{t.deliveryAddress || 'Address on record'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                {t.status === 'ACCEPTED' ? (
                  <Link
                    to="/volunteer/scan"
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan Donor Pickup QR
                  </Link>
                ) : t.status === 'PICKED_UP' ? (
                  <Link
                    to="/volunteer/scan"
                    className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan NGO Delivery QR
                  </Link>
                ) : (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Delivered & Verified
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tasks accepted yet"
          description="Find surplus food donations waiting for transport and accept a task."
          actionText="Browse Available Tasks"
          onAction={() => window.location.assign('/volunteer/available')}
        />
      )}
    </div>
  );
};
