import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert, Clock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireVerifiedNgo?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireVerifiedNgo = false,
}) => {
  const { isAuthenticated, role, user, isNgoVerified, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-2">
          Your account role (<span className="font-semibold text-slate-700">{role}</span>) does not have access to this page.
        </p>
      </div>
    );
  }

  if (requireVerifiedNgo && role === 'NGO' && !isNgoVerified) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">NGO Verification Pending</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Your NGO account (<span className="font-semibold text-slate-800">{user?.organization?.organizationName}</span>) is currently awaiting administrative approval before you can claim surplus donations.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-amber-300 text-xs font-semibold text-amber-800">
          Status: PENDING ADMIN REVIEW
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
