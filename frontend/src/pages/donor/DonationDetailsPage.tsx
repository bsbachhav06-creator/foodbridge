import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationApi } from '../../api/client';
import { DonationResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PickupQrModal } from './PickupQrModal';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Utensils,
  Scale,
  ShieldAlert,
  QrCode,
  Building2,
  Truck,
  CheckCircle2,
  Calendar,
  XCircle,
} from 'lucide-react';

export const DonationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<DonationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await donationApi.getById(Number(id));
      if (res.data.success) {
        setDonation(res.data.data);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load donation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancel = async () => {
    if (!id || !window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await donationApi.cancel(Number(id));
      fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading donation details..." />;
  }

  if (error || !donation) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 text-center">
        <p className="text-sm text-rose-600 font-semibold">{error || 'Donation not found.'}</p>
        <Link
          to="/donor/my-donations"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Donations
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Posted', active: true, done: true },
    {
      label: 'Claimed by NGO',
      active: donation.status !== 'AVAILABLE',
      done: ['CLAIMED', 'VOLUNTEER_ASSIGNED', 'PICKED_UP', 'DELIVERED'].includes(donation.status),
    },
    {
      label: 'Volunteer Assigned',
      active: ['VOLUNTEER_ASSIGNED', 'PICKED_UP', 'DELIVERED'].includes(donation.status),
      done: ['VOLUNTEER_ASSIGNED', 'PICKED_UP', 'DELIVERED'].includes(donation.status),
    },
    {
      label: 'Picked Up (QR)',
      active: ['PICKED_UP', 'DELIVERED'].includes(donation.status),
      done: ['PICKED_UP', 'DELIVERED'].includes(donation.status),
    },
    {
      label: 'Delivered',
      active: donation.status === 'DELIVERED',
      done: donation.status === 'DELIVERED',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/donor/my-donations"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Donations
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={donation.status} />
              <CategoryBadge category={donation.foodCategory} vegetarian={donation.vegetarian} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {donation.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Posted on {new Date(donation.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {donation.assignmentId && (
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
              >
                <QrCode className="w-4 h-4" />
                Show Pickup QR Code
              </button>
            )}

            {(donation.status === 'AVAILABLE' || donation.status === 'CLAIMED') && (
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Cancel Listing
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Custody & Transfer Timeline
          </h3>
          <div className="flex items-center justify-between relative overflow-x-auto pb-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 min-w-[100px] text-center relative">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 z-10 relative ${
                    step.done
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <p className={`text-xs ${step.done ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Food Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Food Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {donation.description || 'No special description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Total Servings</span>
                <p className="text-lg font-bold text-slate-900">{donation.numberOfServings} meals</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold uppercase">Estimated Weight</span>
                <p className="text-lg font-bold text-slate-900">{donation.estimatedWeightKg} kg</p>
              </div>
            </div>

            {donation.allergenInformation && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Allergen Declarations
                </span>
                <p className="text-amber-800">{donation.allergenInformation}</p>
              </div>
            )}

            {donation.specialInstructions && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Pickup Instructions
                </h3>
                <p className="text-xs text-slate-600 italic">{donation.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Right Column: Key Times & Stakeholders */}
          <div className="space-y-6 border-l border-slate-100 md:pl-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Critical Timestamps
              </h3>
              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Prepared:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(donation.preparedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup Ready:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(donation.pickupStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expires At:</span>
                  <span className="font-bold text-amber-700">
                    {new Date(donation.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Claiming NGO Shelter
              </h3>
              {donation.ngoName ? (
                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 space-y-1 text-xs">
                  <p className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    {donation.ngoName}
                  </p>
                  {donation.ngoPhone && (
                    <p className="text-sky-800">Phone: {donation.ngoPhone}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No NGO has claimed this listing yet.</p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assigned Volunteer
              </h3>
              {donation.volunteerName ? (
                <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 text-xs">
                  <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    {donation.volunteerName}
                  </p>
                  {donation.volunteerPhone && (
                    <p className="text-indigo-800">Phone: {donation.volunteerPhone}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Waiting for volunteer driver assignment.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {donation.assignmentId && (
        <PickupQrModal
          assignmentId={donation.assignmentId}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
};
