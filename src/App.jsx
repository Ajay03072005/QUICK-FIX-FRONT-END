import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import AppErrorBoundary from './components/common/AppErrorBoundary';

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
