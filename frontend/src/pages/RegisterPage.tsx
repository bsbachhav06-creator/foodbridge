import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { Role, OrganizationType } from '../types';
import { HeartHandshake, UserPlus, AlertCircle, MapPin, Building2, Utensils, Truck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole: Role = (searchParams.get('role') as Role) || 'DONOR';
  const [role, setRole] = useState<Role>(initialRole);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Organization fields
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('RESTAURANT');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [latitude, setLatitude] = useState<number>(19.0760);
  const [longitude, setLongitude] = useState<number>(72.8777);
  const [operatingHours, setOperatingHours] = useState('09:00 AM - 10:00 PM');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetDemoLocation = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        fullName,
        email,
        password,
        phone,
        role,
      };

      if (role === 'DONOR' || role === 'NGO') {
        payload.organizationName = organizationName;
        payload.organizationType = role === 'NGO' ? 'NGO' : organizationType;
        payload.address = address;
        payload.city = city;
        payload.latitude = latitude;
        payload.longitude = longitude;
        payload.operatingHours = operatingHours;
      }

      const res = await authApi.register(payload);
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);

        switch (user.role) {
          case 'DONOR':
            navigate('/donor/dashboard');
            break;
          case 'NGO':
            navigate('/ngo/dashboard');
            break;
          case 'VOLUNTEER':
            navigate('/volunteer/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.validationErrors
            ? Object.values(err.response.data.validationErrors).join(', ')
            : 'Registration failed. Please check your details.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 mb-3">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Join the FoodBridge Network
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Select your role and start saving edible surplus food today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-slate-200/90 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRole('DONOR');
                  setOrganizationType('RESTAURANT');
                }}
                className={`flex flex-col items-center py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                  role === 'DONOR'
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Utensils className="w-4 h-4 mb-1 text-emerald-600" />
                Food Donor
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('NGO');
                  setOrganizationType('NGO');
                }}
                className={`flex flex-col items-center py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                  role === 'NGO'
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1 text-sky-600" />
                NGO / Shelter
              </button>

              <button
                type="button"
                onClick={() => setRole('VOLUNTEER')}
                className={`flex flex-col items-center py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                  role === 'VOLUNTEER'
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 mb-1 text-amber-600" />
                Volunteer Driver
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="+91 98200 00000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="contact@org.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Organization Specific Fields */}
            {(role === 'DONOR' || role === 'NGO') && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {role === 'DONOR' ? 'Donor Organization Details' : 'NGO Shelter Details'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      placeholder={role === 'DONOR' ? 'e.g. Grand Palace Hotel' : 'e.g. City Food Relief'}
                    />
                  </div>

                  {role === 'DONOR' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Donor Type
                      </label>
                      <select
                        value={organizationType}
                        onChange={(e) => setOrganizationType(e.target.value as OrganizationType)}
                        className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      >
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="HOTEL">Hotel</option>
                        <option value="HOSTEL">Hostel</option>
                        <option value="CANTEEN">Canteen</option>
                        <option value="BAKERY">Bakery</option>
                        <option value="EVENT_ORGANIZER">Event Organizer</option>
                      </select>
                    </div>
                  )}

                  {role === 'NGO' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        placeholder="08:00 AM - 08:00 PM"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Street Address & City *
                    </label>
                    <div className="flex gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleSetDemoLocation(19.0760, 72.8777, 'Bandra Kurla Complex, Mumbai')}
                        className="text-emerald-600 hover:underline"
                      >
                        Mumbai Center
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleSetDemoLocation(18.9256, 72.8242, 'Marine Drive, Nariman Point, Mumbai')}
                        className="text-emerald-600 hover:underline"
                      >
                        South Mumbai
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    placeholder="Enter full physical address"
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
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none"
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
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
