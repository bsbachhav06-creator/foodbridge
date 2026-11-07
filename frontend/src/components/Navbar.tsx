import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  HeartHandshake,
  PlusCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  LogOut,
  User,
  Menu,
  X,
  FileCheck2,
  Users,
  BarChart3,
  ListOrdered
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isDonor, isNgo, isVolunteer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Food<span className="text-emerald-600">Bridge</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Redistribution
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/safety"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/safety') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Food Safety
            </Link>

            {/* DONOR Links */}
            {isDonor && (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/donor/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/donor/create"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Surplus
                </Link>
                <Link
                  to="/donor/my-donations"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/donor/my-donations') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Donations
                </Link>
              </>
            )}

            {/* NGO Links */}
            {isNgo && (
              <>
                <Link
                  to="/ngo/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/ngo/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/ngo/nearby"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/ngo/nearby') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Find Surplus
                </Link>
                <Link
                  to="/ngo/claims"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/ngo/claims') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Claimed Food
                </Link>
              </>
            )}

            {/* VOLUNTEER Links */}
            {isVolunteer && (
              <>
                <Link
                  to="/volunteer/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/volunteer/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/volunteer/available"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/volunteer/available') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Available Pickups
                </Link>
                <Link
                  to="/volunteer/tasks"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/volunteer/tasks') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Tasks
                </Link>
                <Link
                  to="/volunteer/scan"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition"
                >
                  <QrCode className="w-4 h-4" />
                  Scan QR
                </Link>
              </>
            )}

            {/* ADMIN Links */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/ngos"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/ngos') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  NGO Approvals
                </Link>
                <Link
                  to="/admin/users"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/users') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  Users
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/analytics') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  Analytics
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Food Safety
          </Link>

          {isDonor && (
            <>
              <Link
                to="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Donor Dashboard
              </Link>
              <Link
                to="/donor/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 font-bold bg-emerald-50"
              >
                + Post Surplus Food
              </Link>
              <Link
                to="/donor/my-donations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Donations
              </Link>
            </>
          )}

          {isNgo && (
            <>
              <Link
                to="/ngo/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                NGO Dashboard
              </Link>
              <Link
                to="/ngo/nearby"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Find Surplus Food
              </Link>
              <Link
                to="/ngo/claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Claimed Food
              </Link>
            </>
          )}

          {isVolunteer && (
            <>
              <Link
                to="/volunteer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Volunteer Dashboard
              </Link>
              <Link
                to="/volunteer/available"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Available Pickups
              </Link>
              <Link
                to="/volunteer/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Tasks
              </Link>
              <Link
                to="/volunteer/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 font-bold bg-amber-50"
              >
                Scan Verification QR
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/ngos"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Pending NGO Approvals
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Platform Analytics
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
