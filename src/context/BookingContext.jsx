import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingDraft, setBookingDraft] = useState({});

  const updateDraft = (fields) => {
    setBookingDraft(prev => {
      const updated = { ...prev, ...fields };
      const sCharge = updated.service?.startingPrice ?? updated.serviceCharge;
      const dKm = updated.provider?.distance ?? updated.distanceKm;
      const dCharge = updated.provider?.distanceCharge ?? updated.distanceCharge;
      return {
        ...updated,
        serviceCharge: sCharge,
        distanceCharge: dCharge,
        totalPrice: sCharge != null && dCharge != null ? sCharge + dCharge : undefined
      };
    });
  };

  const resetDraft = () => {
    setBookingDraft({
      service: null,
      address: null,
      bookingDate: undefined,
      bookingTime: undefined,
      provider: null
    });
  };

  return (
    <BookingContext.Provider value={{ bookingDraft, updateDraft, resetDraft }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
