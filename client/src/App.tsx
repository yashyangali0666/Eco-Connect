import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { WasteCategoriesPage } from './pages/public/WasteCategoriesPage';
import { WasteCategoryDetailPage } from './pages/public/WasteCategoryDetailPage';
import { SmartWasteGuidePage } from './pages/public/SmartWasteGuidePage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// User / Citizen pages
import { UserDashboard } from './pages/user/UserDashboard';
import { RequestPickupPage } from './pages/user/RequestPickupPage';
import { UserRequestsPage } from './pages/user/UserRequestsPage';
import { TrackRequestPage } from './pages/user/TrackRequestPage';
import { PickupHistoryPage } from './pages/user/PickupHistoryPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Collection Staff pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffRequestsPage } from './pages/staff/StaffRequestsPage';
import { StaffPickupDetailPage } from './pages/staff/StaffPickupDetailPage';
import { StaffHistoryPage } from './pages/staff/StaffHistoryPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminRequestDetailPage } from './pages/admin/AdminRequestDetailPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with standard layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/waste-categories" element={<WasteCategoriesPage />} />
        <Route path="/waste-categories/:slug" element={<WasteCategoryDetailPage />} />
        <Route path="/smart-guide" element={<SmartWasteGuidePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Citizen / User Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/request-pickup" element={<RequestPickupPage />} />
        <Route path="/requests" element={<UserRequestsPage />} />
        <Route path="/requests/:id" element={<TrackRequestPage />} />
        <Route path="/history" element={<PickupHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Staff Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['STAFF']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/requests" element={<StaffRequestsPage />} />
        <Route path="/staff/requests/:id" element={<StaffPickupDetailPage />} />
        <Route path="/staff/history" element={<StaffHistoryPage />} />
      </Route>

      {/* Admin Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/requests" element={<AdminRequestsPage />} />
        <Route path="/admin/requests/:id" element={<AdminRequestDetailPage />} />
        <Route path="/admin/staff" element={<AdminStaffPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/history" element={<AdminRequestsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
