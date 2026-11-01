import React, { createContext, useCallback, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingDraft, setBookingDraft] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('quickfix_booking_draft') || '{}');
    } catch {
      return {};
    }
  });

  const updateDraft = useCallback((fields) => {
    setBookingDraft(prev => {
      const updated = { ...prev, ...fields };
      const sCharge = updated.service?.startingPrice ?? updated.serviceCharge;
      const dKm = updated.provider?.distance ?? updated.distanceKm;
      const dCharge = updated.provider?.distanceCharge ?? updated.distanceCharge;
      const nextDraft = {
        ...updated,
        serviceCharge: sCharge,
        distanceCharge: dCharge,
        totalPrice: sCharge != null && dCharge != null ? sCharge + dCharge : undefined
      };
      sessionStorage.setItem('quickfix_booking_draft', JSON.stringify(nextDraft));
      return nextDraft;
    });
  }, []);

  const resetDraft = useCallback(() => {
    const emptyDraft = {
      service: null,
      address: null,
      bookingDate: undefined,
      bookingTime: undefined,
      provider: null
    };
    sessionStorage.removeItem('quickfix_booking_draft');
    setBookingDraft(emptyDraft);
  }, []);

  return (
    <BookingContext.Provider value={{ bookingDraft, updateDraft, resetDraft }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
