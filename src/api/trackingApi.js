import axiosInstance from './axiosInstance';

const normalizeLocation = (location) => location ? ({
  ...location,
  lat: location.latitude,
  lng: location.longitude
}) : null;

export const trackingApi = {
  getLatest: async (bookingUniqueId) => {
    const res = await axiosInstance.get(`/bookings/${bookingUniqueId}/tracking/latest`);
    return res.status === 204 ? null : normalizeLocation(res.data);
  },

  sendLocation: async (bookingUniqueId, location) => {
    const res = await axiosInstance.post(`/bookings/${bookingUniqueId}/tracking/location`, location);
    return normalizeLocation(res.data);
  }
};
