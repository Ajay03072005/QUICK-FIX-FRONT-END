import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

// Provider Pages
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import BookingRequestsPage from '../pages/provider/BookingRequestsPage';
import ActiveServicePage from '../pages/provider/ActiveServicePage';
import ServiceHistoryPage from '../pages/provider/ServiceHistoryPage';
import ProviderProfilePage from '../pages/provider/ProviderProfilePage';
import ProviderServicesPage from '../pages/provider/ProviderServicesPage';
import ProviderAvailabilityPage from '../pages/provider/ProviderAvailabilityPage';
import ProviderNotificationsPage from '../pages/provider/ProviderNotificationsPage';

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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/customer/find-service" element={<ServicesPage />} />
      <Route path="/customer/select-address" element={<SelectAddressPage />} />
      <Route path="/customer/provider-suggestions" element={<FindNearbyPage />} />
      <Route path="/customer/provider-selection" element={<ProviderSelectionPage />} />
      <Route path="/customer/booking-confirmation" element={<BookingConfirmationPage />} />
      <Route path="/customer/bookings" element={<MyBookingsPage />} />
      <Route path="/customer/bookings/:uniqueId" element={<BookingTrackingPage />} />
      <Route path="/customer/bookings/:uniqueId/track" element={<BookingTrackingPage />} />
      <Route path="/customer/profile" element={<CustomerProfilePage />} />
      <Route path="/customer/addresses" element={<SavedAddressesPage />} />
      <Route path="/customer/notifications" element={<CustomerNotificationsPage />} />
      <Route path="/customer/reviews" element={<ReviewsPage />} />

      {/* Provider Routes */}
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/booking-requests" element={<BookingRequestsPage />} />
      <Route path="/provider/active-service" element={<ActiveServicePage />} />
      <Route path="/provider/active-service/:uniqueId" element={<ActiveServicePage />} />
      <Route path="/provider/history" element={<ServiceHistoryPage />} />
      <Route path="/provider/profile" element={<ProviderProfilePage />} />
      <Route path="/provider/services" element={<ProviderServicesPage />} />
      <Route path="/provider/availability" element={<ProviderAvailabilityPage />} />
      <Route path="/provider/notifications" element={<ProviderNotificationsPage />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
