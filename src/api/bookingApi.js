import axiosInstance from './axiosInstance';

const normalizeBooking = (booking) => ({
  ...booking,
  bookingUniqueId: booking.bookingUniqueId || booking.uniqueId,
  customerAddress: [booking.addressLine1, booking.city].filter(Boolean).join(', '),
  distanceKm: booking.distance,
  totalPrice: booking.totalPrice ?? booking.totalAmount
});

export const bookingApi = {
  createBooking: async (customerUniqueId, bookingRequest) => {
    const payload = {
      serviceUniqueId: bookingRequest.serviceUniqueId,
      addressUniqueId: bookingRequest.addressUniqueId || null,
      address: bookingRequest.addressUniqueId ? null : {
        addressLine1: bookingRequest.addressLine1,
        addressLine2: bookingRequest.addressLine2,
        city: bookingRequest.city,
        state: bookingRequest.state,
        country: bookingRequest.country,
        postalCode: bookingRequest.postalCode,
        latitude: bookingRequest.latitude,
        longitude: bookingRequest.longitude
      },
      recipientName: bookingRequest.recipientName,
      recipientPhone: bookingRequest.recipientPhone,
      bookingDate: bookingRequest.bookingDate,
      bookingTime: bookingRequest.bookingTime,
      providerUniqueId: bookingRequest.providerUniqueId || null
    };

    const res = await axiosInstance.post('/bookings', payload, {
      params: { customerUniqueId }
    });
    return normalizeBooking(res.data);
  },

  findNearbyProviders: async ({ serviceUniqueId, latitude, longitude, addressUniqueId, maxDistanceKm = 30 }) => {
    const params = { serviceUniqueId, maxDistanceKm };
    if (latitude != null && longitude != null) {
      params.latitude = latitude;
      params.longitude = longitude;
    }
    if (addressUniqueId) {
      params.addressUniqueId = addressUniqueId;
    }
    const res = await axiosInstance.get('/bookings/providers', { params });
    return res.data;
  },

  findNearbyProvidersForBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.get(`/bookings/${bookingUniqueId}/providers`);
    return res.data;
  },

  deleteBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.delete(`/bookings/${bookingUniqueId}`);
    return res.data;
  },

  selectProviderForBooking: async (bookingUniqueId, providerUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/provider`, {
      providerUniqueId
    });
    return normalizeBooking(res.data);
  },

  getBookingById: async (bookingUniqueId) => {
    const res = await axiosInstance.get(`/bookings/${bookingUniqueId}`);
    return normalizeBooking(res.data);
  },

  acceptBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/accept`);
    return normalizeBooking(res.data);
  },

  rejectBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/reject`);
    return normalizeBooking(res.data);
  },

  startBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/start`);
    return normalizeBooking(res.data);
  },

  markEnRoute: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/en-route`);
    return normalizeBooking(res.data);
  },

  completeBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/complete`);
    return normalizeBooking(res.data);
  },

  cancelBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/cancel`);
    return normalizeBooking(res.data);
  },

  providerCancelBooking: async (bookingUniqueId) => {
    const res = await axiosInstance.put(`/bookings/${bookingUniqueId}/provider-cancel`);
    return normalizeBooking(res.data);
  },

  getCustomerBookings: async (customerUniqueId) => {
    const res = await axiosInstance.get(`/bookings/customer/${customerUniqueId}`);
    return (res.data || []).map(normalizeBooking);
  },

  getProviderBookings: async (providerId) => {
    const res = await axiosInstance.get(`/bookings/provider/${providerId}`);
    return (res.data || []).map(normalizeBooking);
  },

  getAllBookings: async () => {
    const res = await axiosInstance.get('/bookings');
    return (res.data || []).map(normalizeBooking);
  }
};

bookingApi.acceptBookingRequest = bookingApi.acceptBooking;
bookingApi.rejectBookingRequest = bookingApi.rejectBooking;
