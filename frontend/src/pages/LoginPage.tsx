import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { HeartHandshake, LogIn, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || null;

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);

        if (from) {
          navigate(from, { replace: true });
        } else {
          // Redirect based on role
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
            case 'ADMIN':
              navigate('/admin/dashboard');
              break;
            default:
              navigate('/');
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 mb-3">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back to FoodBridge
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to your donor, NGO, or volunteer account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-slate-200/90 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Selector */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Demo Account Autofill:
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('donor@foodbridge.local', 'Donor@123')}
                className="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 transition text-left"
              >
                🍽️ Donor (Bistro)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ngo@foodbridge.local', 'Ngo@123')}
                className="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 transition text-left"
              >
                🏢 Verified NGO
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('volunteer@foodbridge.local', 'Volunteer@123')}
                className="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 transition text-left"
              >
                🚚 Volunteer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@foodbridge.local', 'Admin@123')}
                className="py-1.5 px-2 bg-white rounded-lg border border-emerald-200 font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 transition text-left"
              >
                🛡️ Platform Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('unverified-ngo@foodbridge.local', 'Ngo@123')}
                className="col-span-2 py-1.5 px-2 bg-white rounded-lg border border-amber-300 font-semibold text-amber-800 hover:bg-amber-50 transition text-left"
              >
                ⏳ Unverified NGO (Tests Admin Approval Flow)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
