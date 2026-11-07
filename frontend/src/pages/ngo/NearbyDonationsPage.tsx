import React, { useState, useEffect } from 'react';
import { donationApi, claimApi } from '../../api/client';
import { DonationResponse, FoodCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryBadge } from '../../components/CategoryBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  Clock,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

// Custom Leaflet Marker Icon using standard SVG pins to avoid asset load bugs
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const NearbyDonationsPage: React.FC = () => {
  const { user, isNgoVerified } = useAuth();
  const [donations, setDonations] = useState<DonationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Center around user's registered organization coordinates, or default Mumbai
  const defaultLat = user?.organization?.latitude || 19.0760;
  const defaultLng = user?.organization?.longitude || 72.8777;

  const [radiusKm, setRadiusKm] = useState<number>(10.0);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNearby = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await donationApi.getNearby({
        latitude: defaultLat,
        longitude: defaultLng,
        radiusKm,
      });
      if (res.data.success) {
        setDonations(res.data.data);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to search nearby donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [radiusKm]);

  const handleClaim = async (donationId: number) => {
    if (!isNgoVerified) {
      alert('Your NGO account is awaiting admin approval. You cannot claim food until verified.');
      return;
    }

    if (!window.confirm('Do you want to confirm this surplus food claim for your shelter?')) return;

    setClaimingId(donationId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await claimApi.claim(donationId);
      if (res.data.success) {
        setSuccessMessage(`Donation claimed successfully! A volunteer driver will be assigned for pickup.`);
        fetchNearby();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to claim donation');
    } finally {
      setClaimingId(null);
    }
  };

  const filtered = donations.filter((d) => {
    return categoryFilter === 'ALL' || d.foodCategory === categoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nearby Available Food Surplus
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time Haversine geolocation lookup within {radiusKm} km of your shelter.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'list'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'map'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            OpenStreetMap View
          </button>
        </div>
      </div>

      {/* Verification Warning if NGO not verified */}
      {!isNgoVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">NGO Verification Pending</p>
            <p>
              Your NGO account has not been approved by an administrator yet. You can inspect nearby donations, but claiming is disabled until verified.
            </p>
          </div>
        </div>
      )}

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Radius Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Radius:
          </span>
          {[5, 10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                radiusKm === r
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'COOKED_FOOD', label: 'Cooked Meals' },
            { id: 'BAKERY', label: 'Bakery' },
            { id: 'PACKAGED_FOOD', label: 'Packaged' },
            { id: 'FRUITS_VEGETABLES', label: 'Produce' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Map View vs List View */}
      {loading ? (
        <LoadingSpinner message="Searching nearby donations..." />
      ) : viewMode === 'map' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-3 h-[550px] relative">
          <MapContainer
            center={[defaultLat, defaultLng]}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full rounded-xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marker for NGO Center */}
            <Marker position={[defaultLat, defaultLng]} icon={customMarkerIcon}>
              <Popup>
                <div className="p-1 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">📍 Your NGO Shelter Center</p>
                  <p className="text-[11px] text-slate-500">{user?.organization?.organizationName || 'Shelter Base'}</p>
                </div>
              </Popup>
            </Marker>

            {/* Markers for Donations */}
            {filtered.map((d) => (
              <Marker key={d.id} position={[d.latitude, d.longitude]} icon={customMarkerIcon}>
                <Popup>
                  <div className="p-2 space-y-2 max-w-[220px]">
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={d.foodCategory} vegetarian={d.vegetarian} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{d.title}</h4>
                    <p className="text-[11px] text-slate-600">
                      <strong>{d.numberOfServings}</strong> servings ({d.estimatedWeightKg} kg)
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Expires: {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {d.distanceKm !== undefined && (
                      <p className="text-[11px] font-bold text-emerald-700">
                        📍 {d.distanceKm} km away
                      </p>
                    )}
                    <button
                      onClick={() => handleClaim(d.id)}
                      disabled={!isNgoVerified || claimingId === d.id}
                      className="w-full mt-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                    >
                      {claimingId === d.id ? 'Claiming...' : 'Claim This Food'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="h-44 bg-slate-100 relative">
                {d.imagePath ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || ''}${d.imagePath}`}
                    alt={d.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50/50 text-emerald-600">
                    <Utensils className="w-10 h-10 opacity-30" />
                  </div>
                )}
                {d.distanceKm !== undefined && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {d.distanceKm} km away
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <CategoryBadge category={d.foodCategory} vegetarian={d.vegetarian} />
                  <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">{d.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {d.description || 'Surplus meal available from verified kitchen.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Servings / Weight:</span>
                    <span className="font-semibold text-slate-800">
                      {d.numberOfServings} meals ({d.estimatedWeightKg} kg)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Donor:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">
                      {d.donorOrganizationName || d.donorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pickup Expiry:</span>
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(d.id)}
                  disabled={!isNgoVerified || claimingId === d.id}
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {claimingId === d.id ? (
                    'Claiming...'
                  ) : !isNgoVerified ? (
                    'Pending Verification'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Claim This Donation
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No available surplus food nearby"
          description={`No donations found within ${radiusKm} km. Try increasing the search radius.`}
          actionText="Expand to 25 km"
          onAction={() => setRadiusKm(25)}
        />
      )}
    </div>
  );
};
