import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationApi } from '../../api/client';
import { DonationResponse, DonationStatus, FoodCategory } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { PickupQrModal } from './PickupQrModal';
import { PlusCircle, Search, Eye, QrCode, XCircle, Clock, MapPin } from 'lucide-react';

export const MyDonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<DonationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQrAssignmentId, setActiveQrAssignmentId] = useState<number | null>(null);

  const fetchMyDonations = async () => {
    try {
      const res = await donationApi.getMy();
      if (res.data.success) {
        setDonations(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch my donations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleCancelDonation = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await donationApi.cancel(id);
      fetchMyDonations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel donation');
    }
  };

  const filteredDonations = donations.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.foodCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.ngoName && d.ngoName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Food Donations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete history of surplus food listings, claims, and verified pickups.
          </p>
        </div>
        <Link
          to="/donor/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Food
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, category, NGO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'AVAILABLE', 'CLAIMED', 'VOLUNTEER_ASSIGNED', 'PICKED_UP', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Loading donations..." />
      ) : filteredDonations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={d.status} />
                  <span className="text-[11px] text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <CategoryBadge category={d.foodCategory} vegetarian={d.vegetarian} />
                  <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">{d.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{d.description || 'No description provided.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Servings / Weight:</span>
                    <span className="font-semibold text-slate-800">{d.numberOfServings} meals ({d.estimatedWeightKg} kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expires:</span>
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {d.ngoName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Claimed By:</span>
                      <span className="font-semibold text-sky-700 truncate max-w-[170px]">{d.ngoName}</span>
                    </div>
                  )}
                  {d.volunteerName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volunteer:</span>
                      <span className="font-semibold text-indigo-700">{d.volunteerName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/donor/donations/${d.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </Link>

                <div className="flex items-center gap-1.5">
                  {(d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'CLAIMED') && d.assignmentId && (
                    <button
                      onClick={() => setActiveQrAssignmentId(d.assignmentId!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Pickup QR
                    </button>
                  )}

                  {(d.status === 'AVAILABLE' || d.status === 'CLAIMED') && (
                    <button
                      onClick={() => handleCancelDonation(d.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Cancel Donation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching donations found"
          description="Try clearing your search query or status filter to see other donations."
        />
      )}

      {/* Pickup QR Modal */}
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
