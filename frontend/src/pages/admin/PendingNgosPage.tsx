import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { UserDto } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';

export const PendingNgosPage: React.FC = () => {
  const [pendingNgos, setPendingNgos] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await adminApi.getPendingNgos();
      if (res.data.success) {
        setPendingNgos(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch pending NGOs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (orgId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to approve and verify NGO "${name}"?`)) return;

    setProcessingId(orgId);
    setMessage(null);
    setError(null);

    try {
      const res = await adminApi.verifyNgo(orgId);
      if (res.data.success) {
        setMessage(`NGO "${name}" successfully verified! They can now claim surplus donations.`);
        fetchPending();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orgId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to reject verification for "${name}"?`)) return;

    setProcessingId(orgId);
    setMessage(null);
    setError(null);

    try {
      const res = await adminApi.rejectNgo(orgId);
      if (res.data.success) {
        setMessage(`NGO "${name}" verification request rejected.`);
        fetchPending();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pending NGO Verification Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review credentials and approve charities before they are permitted to claim surplus food.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading pending applications..." />
      ) : pendingNgos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingNgos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Pending Review
                  </span>
                  <span className="text-xs text-slate-400">ID #{ngo.id}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {ngo.organization?.organizationName || 'Unnamed Charity'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contact: <strong className="text-slate-700">{ngo.fullName}</strong>
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ngo.organization?.address}, {ngo.organization?.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ngo.email}</span>
                  </div>
                  {ngo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ngo.phone}</span>
                    </div>
                  )}
                  {ngo.organization?.operatingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Hours: {ngo.organization.operatingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    ngo.organization?.id &&
                    handleVerify(ngo.organization.id, ngo.organization.organizationName)
                  }
                  disabled={processingId === ngo.organization?.id}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() =>
                    ngo.organization?.id &&
                    handleReject(ngo.organization.id, ngo.organization.organizationName)
                  }
                  disabled={processingId === ngo.organization?.id}
                  className="py-2 px-3 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No pending NGO verification requests"
          description="All registered NGO and shelter accounts have been reviewed and processed."
        />
      )}
    </div>
  );
};
