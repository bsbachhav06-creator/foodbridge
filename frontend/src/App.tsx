import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FoodSafetyPage } from './pages/FoodSafetyPage';

// Donor pages
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage';
import { CreateDonationPage } from './pages/donor/CreateDonationPage';
import { MyDonationsPage } from './pages/donor/MyDonationsPage';
import { DonationDetailsPage } from './pages/donor/DonationDetailsPage';

// NGO pages
import { NgoDashboardPage } from './pages/ngo/NgoDashboardPage';
import { NearbyDonationsPage } from './pages/ngo/NearbyDonationsPage';
import { ClaimedDonationsPage } from './pages/ngo/ClaimedDonationsPage';

// Volunteer pages
import { VolunteerDashboardPage } from './pages/volunteer/VolunteerDashboardPage';
import { AvailablePickupsPage } from './pages/volunteer/AvailablePickupsPage';
import { MyTasksPage } from './pages/volunteer/MyTasksPage';
import { QrScannerPage } from './pages/volunteer/QrScannerPage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { PendingNgosPage } from './pages/admin/PendingNgosPage';
import { UsersListPage } from './pages/admin/UsersListPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/safety" element={<FoodSafetyPage />} />

              {/* Donor Routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <DonorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/create"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <CreateDonationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/my-donations"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <MyDonationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/donations/:id"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN', 'NGO', 'VOLUNTEER']}>
                    <DonationDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* NGO Routes */}
              <Route
                path="/ngo/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <NgoDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/nearby"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <NearbyDonationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/claims"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <ClaimedDonationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer Routes */}
              <Route
                path="/volunteer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <VolunteerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/available"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <AvailablePickupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/tasks"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <MyTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/scan"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <QrScannerPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ngos"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <PendingNgosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UsersListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
