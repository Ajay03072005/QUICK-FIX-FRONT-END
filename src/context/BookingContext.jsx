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
      // Keep authoritative calculated serviceCharge from dynamic options/packages, falling back to startingPrice
      let sCharge = fields.serviceCharge !== undefined && Number(fields.serviceCharge) > 0
        ? Number(fields.serviceCharge)
        : (prev.serviceCharge && Number(prev.serviceCharge) > 0
            ? Number(prev.serviceCharge)
            : (updated.serviceCharge && Number(updated.serviceCharge) > 0
                ? Number(updated.serviceCharge)
                : (updated.service?.startingPrice && Number(updated.service.startingPrice) > 0
                    ? Number(updated.service.startingPrice)
                    : (fields.serviceCharge !== undefined ? Number(fields.serviceCharge) : (Number(updated.serviceCharge) || 0)))));

      const pricingSelection = fields.pricingSelection !== undefined
        ? fields.pricingSelection
        : (updated.pricingSelection || prev.pricingSelection || null);

      const dKm = updated.provider?.distance ?? updated.distanceKm;
      const dCharge = updated.provider?.distanceCharge ?? updated.distanceCharge;
      const nextDraft = {
        ...updated,
        serviceCharge: sCharge,
        pricingSelection,
        distanceCharge: dCharge,
        totalPrice: sCharge != null ? (dCharge != null ? sCharge + dCharge : sCharge) : undefined
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
