import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { donationApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FoodCategory } from '../../types';
import {
  Utensils,
  PlusCircle,
  Upload,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const CreateDonationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('COOKED_FOOD');
  const [description, setDescription] = useState('');
  const [vegetarian, setVegetarian] = useState(true);
  const [allergenInformation, setAllergenInformation] = useState('');
  const [numberOfServings, setNumberOfServings] = useState<number>(30);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(10.0);

  // Time states: defaults to now, pickup in 15 mins, expiry in 6 hours
  const now = new Date();
  const defaultPrep = new Date(now.getTime() - 30 * 60000).toISOString().slice(0, 16);
  const defaultPickup = new Date(now.getTime() + 15 * 60000).toISOString().slice(0, 16);
  const defaultExpiry = new Date(now.getTime() + 6 * 3600000).toISOString().slice(0, 16);

  const [preparedAt, setPreparedAt] = useState(defaultPrep);
  const [pickupStartTime, setPickupStartTime] = useState(defaultPickup);
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);

  // Location states
  const [pickupAddress, setPickupAddress] = useState(
    user?.organization?.address || '12 Marine Drive, Nariman Point, Mumbai'
  );
  const [latitude, setLatitude] = useState<number>(user?.organization?.latitude || 18.9256);
  const [longitude, setLongitude] = useState<number>(user?.organization?.longitude || 72.8242);
  const [specialInstructions, setSpecialInstructions] = useState('Collect from kitchen dispatch counter.');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title,
        foodCategory,
        description,
        vegetarian,
        allergenInformation,
        numberOfServings: Number(numberOfServings),
        estimatedWeightKg: Number(estimatedWeightKg),
        preparedAt: new Date(preparedAt).toISOString(),
        pickupStartTime: new Date(pickupStartTime).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        pickupAddress,
        latitude: Number(latitude),
        longitude: Number(longitude),
        specialInstructions,
      };

      const res = await donationApi.create(payload);
      if (res.data.success) {
        const createdId = res.data.data.id;

        // If file selected, upload image
        if (selectedFile) {
          try {
            await donationApi.uploadImage(createdId, selectedFile);
          } catch (uploadErr) {
            console.error('Image upload failed but donation was created', uploadErr);
          }
        }

        navigate('/donor/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.validationErrors
            ? Object.values(err.response.data.validationErrors).join(', ')
            : 'Failed to create donation. Please check your inputs.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/donor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Post Surplus Food
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide accurate quantity, holding temperature, and expiry window for verified NGOs.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
              Food Overview
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                placeholder="e.g. Fresh Vegetable Pulav & Paneer Tikka"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Food Category *
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="COOKED_FOOD">Cooked Food / Meals</option>
                  <option value="BAKERY">Bakery & Breads</option>
                  <option value="PACKAGED_FOOD">Packaged Goods</option>
                  <option value="FRUITS_VEGETABLES">Fruits & Vegetables</option>
                  <option value="OTHER">Other Surplus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Dietary Classification
                </label>
                <div className="mt-1 flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="veg"
                      checked={vegetarian}
                      onChange={() => setVegetarian(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-700">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="veg"
                      checked={!vegetarian}
                      onChange={() => setVegetarian(false)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-700">Non-Vegetarian</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description & Packaging Condition
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                placeholder="Mention whether items are packed in commercial trays, foil containers, or insulated boxes."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Allergen Warnings
              </label>
              <input
                type="text"
                value={allergenInformation}
                onChange={(e) => setAllergenInformation(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                placeholder="e.g. Contains dairy (ghee), peanuts, gluten"
              />
            </div>
          </div>

          {/* Section 2: Quantity & Metrics */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
              Quantity & Impact Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Number of Servings *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={numberOfServings}
                  onChange={(e) => setNumberOfServings(Number(e.target.value))}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Estimated Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={estimatedWeightKg}
                  onChange={(e) => setEstimatedWeightKg(Number(e.target.value))}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Time Windows */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
              Safety Timeline & Expiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Prepared At *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={preparedAt}
                  onChange={(e) => setPreparedAt(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pickup Ready At *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupStartTime}
                  onChange={(e) => setPickupStartTime(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Expires At *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pickup Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
              Pickup Location
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Pickup Address *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Special Pickup Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none"
                placeholder="e.g. Knock on loading gate door, ask for chef Rahul"
              />
            </div>
          </div>

          {/* Section 5: Photo Upload */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
              Food Photo (Optional)
            </h3>

            <div className="flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Food Preview"
                  className="w-24 h-24 object-cover rounded-xl border border-slate-300 shrink-0"
                />
              )}
              <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center transition bg-slate-50/50">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-emerald-700">Choose photo</span>
                <span className="text-xs text-slate-400 block mt-0.5">JPG, PNG, WebP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              to="/donor/dashboard"
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading ? (
                'Posting Food...'
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Publish Surplus Donation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
