import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import ServicesPage from '../pages/public/ServicesPage';
import ServiceDetailsPage from '../pages/public/ServiceDetailsPage';
import ProviderDetailsPage from '../pages/public/ProviderDetailsPage';
import FindNearbyPage from '../pages/public/FindNearbyPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import SelectAddressPage from '../pages/customer/SelectAddressPage';
import ProviderSelectionPage from '../pages/customer/ProviderSelectionPage';
import BookingConfirmationPage from '../pages/customer/BookingConfirmationPage';
import BookingTrackingPage from '../pages/customer/BookingTrackingPage';
import MyBookingsPage from '../pages/customer/MyBookingsPage';
import SavedAddressesPage from '../pages/customer/SavedAddressesPage';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';
import CustomerNotificationsPage from '../pages/customer/CustomerNotificationsPage';
import ReviewsPage from '../pages/customer/ReviewsPage';
import BookingPaymentPage from '../pages/customer/BookingPaymentPage';
import PaymentResultPage from '../pages/customer/PaymentResultPage';
import PaymentReceiptPage from '../pages/customer/PaymentReceiptPage';
import AdminPortalPage from '../pages/admin/AdminPortalPage';
import SupportPortalPage from '../pages/support/SupportPortalPage';

// Provider Pages
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import BookingRequestsPage from '../pages/provider/BookingRequestsPage';
import ActiveServicePage from '../pages/provider/ActiveServicePage';
import ServiceHistoryPage from '../pages/provider/ServiceHistoryPage';
import ProviderProfilePage from '../pages/provider/ProviderProfilePage';
import ProviderServicesPage from '../pages/provider/ProviderServicesPage';
import ProviderServiceDiscoveryPage from '../pages/provider/ProviderServiceDiscoveryPage';
import ProviderServiceGuidancePage from '../pages/provider/ProviderServiceGuidancePage';
import ProviderAvailabilityPage from '../pages/provider/ProviderAvailabilityPage';
import ProviderNotificationsPage from '../pages/provider/ProviderNotificationsPage';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      const moduleLogin = allowedRoles.includes('CUSTOMER')
        ? '/customer/login'
        : allowedRoles.includes('PROVIDER')
          ? '/provider/login'
          : '/login';
      return <Navigate to={moduleLogin} replace />;
    }
  }

  return children;
}

function AdminRoute({ children }) {
  const { userRole, isAuthenticated } = useAuth();
  if (isAuthenticated && userRole === 'CUSTOMER') {
    return <Navigate to="/customer/dashboard" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:uniqueId" element={<ServiceDetailsPage />} />
      <Route path="/providers/:uniqueId" element={<ProviderDetailsPage />} />
      <Route path="/find-nearby" element={<FindNearbyPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/customer/login" element={<LoginPage />} />
      <Route path="/customer/register" element={<RegisterPage />} />
      <Route path="/provider/login" element={<LoginPage />} />
      <Route path="/provider/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPortalPage /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminPortalPage defaultTab="admin-profile" /></AdminRoute>} />
      <Route path="/support" element={<ProtectedRoute role={['SUPPORT', 'ADMIN']}><SupportPortalPage /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/find-service" element={<ProtectedRoute role="CUSTOMER"><ServicesPage /></ProtectedRoute>} />
      <Route path="/customer/select-address" element={<ProtectedRoute role="CUSTOMER"><SelectAddressPage /></ProtectedRoute>} />
      <Route path="/customer/provider-suggestions" element={<ProtectedRoute role="CUSTOMER"><FindNearbyPage /></ProtectedRoute>} />
      <Route path="/customer/provider-selection" element={<ProtectedRoute role="CUSTOMER"><ProviderSelectionPage /></ProtectedRoute>} />
      <Route path="/customer/booking-confirmation" element={<ProtectedRoute role="CUSTOMER"><BookingConfirmationPage /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute role="CUSTOMER"><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/customer/bookings/:uniqueId" element={<ProtectedRoute role="CUSTOMER"><BookingTrackingPage /></ProtectedRoute>} />
      <Route path="/customer/bookings/:uniqueId/track" element={<ProtectedRoute role="CUSTOMER"><BookingTrackingPage /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute role="CUSTOMER"><CustomerProfilePage /></ProtectedRoute>} />
      <Route path="/customer/addresses" element={<ProtectedRoute role="CUSTOMER"><SavedAddressesPage /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute role="CUSTOMER"><CustomerNotificationsPage /></ProtectedRoute>} />
      <Route path="/customer/reviews" element={<ProtectedRoute role="CUSTOMER"><ReviewsPage /></ProtectedRoute>} />
      <Route path="/customer/payment/:uniqueId" element={<ProtectedRoute role="CUSTOMER"><BookingPaymentPage /></ProtectedRoute>} />
      <Route path="/customer/payment/result/:paymentRef" element={<ProtectedRoute role="CUSTOMER"><PaymentResultPage /></ProtectedRoute>} />
      <Route path="/customer/receipt/:paymentRef" element={<ProtectedRoute role="CUSTOMER"><PaymentReceiptPage /></ProtectedRoute>} />

      {/* Provider Routes */}
      <Route path="/provider/dashboard" element={<ProtectedRoute role="PROVIDER"><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/booking-requests" element={<ProtectedRoute role="PROVIDER"><BookingRequestsPage /></ProtectedRoute>} />
      <Route path="/provider/active-service" element={<ProtectedRoute role="PROVIDER"><ActiveServicePage /></ProtectedRoute>} />
      <Route path="/provider/active-service/:uniqueId" element={<ProtectedRoute role="PROVIDER"><ActiveServicePage /></ProtectedRoute>} />
      <Route path="/provider/history" element={<ProtectedRoute role="PROVIDER"><ServiceHistoryPage /></ProtectedRoute>} />
      <Route path="/provider/profile" element={<ProtectedRoute role="PROVIDER"><ProviderProfilePage /></ProtectedRoute>} />
      <Route path="/provider/services" element={<ProtectedRoute role="PROVIDER"><ProviderServicesPage /></ProtectedRoute>} />
      <Route path="/provider/services/discover" element={<ProtectedRoute role="PROVIDER"><ProviderServiceDiscoveryPage /></ProtectedRoute>} />
      <Route path="/provider/services/:serviceUniqueId/guidance" element={<ProtectedRoute role="PROVIDER"><ProviderServiceGuidancePage /></ProtectedRoute>} />
      <Route path="/provider/availability" element={<ProtectedRoute role="PROVIDER"><ProviderAvailabilityPage /></ProtectedRoute>} />
      <Route path="/provider/notifications" element={<ProtectedRoute role="PROVIDER"><ProviderNotificationsPage /></ProtectedRoute>} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
