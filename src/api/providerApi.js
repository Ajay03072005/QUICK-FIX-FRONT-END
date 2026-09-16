import axiosInstance from './axiosInstance';

export const providerApi = {
  getAllProviders: async () => {
    const res = await axiosInstance.get('/providers');
    return (res.data || []).map((p) => ({
      providerUniqueId: p.uniqueId,
      providerName: p.name,
      contactPerson: p.name,
      phone: p.phoneNumber,
      email: p.email,
      availability: p.availabilityStatus,
      address: p.addresses?.[0]?.city,
      latitude: p.addresses?.[0]?.latitude,
      longitude: p.addresses?.[0]?.longitude,
      services: (p.providerServices || []).map(s => s.service)
    }));
  },

  getProviderById: async (id) => {
    const res = await axiosInstance.get(`/providers/unique/${id}`);
    const p = res.data;
    return {
      providerUniqueId: p.uniqueId,
      providerName: p.name,
      contactPerson: p.name,
      phone: p.phoneNumber,
      email: p.email,
      availability: p.availabilityStatus,
      address: p.addresses?.[0]?.city,
      latitude: p.addresses?.[0]?.latitude,
      longitude: p.addresses?.[0]?.longitude,
      services: (p.providerServices || []).map(s => s.service),
      reviews: []
    };
  },

  createProvider: async (providerPayload) => {
    const res = await axiosInstance.post('/providers', providerPayload);
    return res.data;
  },

  getNearbyProviders: async (serviceId, addressId) => {
    return await providerApi.getAllProviders();
  },

  getProviderDashboardStats: async (providerId) => {
    const bookingsRes = await axiosInstance.get(`/bookings/provider/${providerId}`);
    const bookings = bookingsRes.data || [];
    const completed = bookings.filter(b => b.status === 'COMPLETED');
    return {
      todaysJobs: bookings.length,
      pendingRequests: bookings.filter(b => b.status === 'WAITING_FOR_PROVIDER').length,
      completedJobs: completed.length,
      todaysEarnings: completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    };
  },

  updateAvailability: async (providerId, status) => {
    const path = /^\d+$/.test(String(providerId))
      ? `/providers/${providerId}/availability`
      : `/providers/unique/${providerId}/availability`;
    const res = await axiosInstance.put(path, null, { params: { status } });
    return res.data;
  }
};
