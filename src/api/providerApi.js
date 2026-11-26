import axiosInstance from './axiosInstance';

export const providerApi = {
  getAllProviders: async () => {
    const res = await axiosInstance.get('/providers');
    return (res.data || []).map((p) => {
      const address = p.addresses?.find((item) => item.primary) || p.addresses?.[0];
      const latitude = address?.latitude == null ? NaN : Number(address.latitude);
      const longitude = address?.longitude == null ? NaN : Number(address.longitude);
      return {
        providerUniqueId: p.uniqueId,
        providerName: p.name,
        contactPerson: p.name,
        phone: p.phoneNumber,
        email: p.email,
        availability: p.availabilityStatus,
        address: [address?.city, address?.state].filter(Boolean).join(', '),
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
        coordinates: Number.isFinite(latitude) && Number.isFinite(longitude) ? { lat: latitude, lng: longitude } : null,
        services: (p.providerServices || [])
          .filter((service) => !service.status || String(service.status).toUpperCase() === 'ACTIVE')
          .map((service) => service.service),
        rating: Number(p.rating || 0),
        reviewCount: Number(p.reviewCount || 0),
        avatar: p.profileImage || p.avatar
      };
    });
  },

  getProviderById: async (id) => {
    const res = await axiosInstance.get(`/providers/unique/${id}`);
    const p = res.data;
    const addresses = (p.addresses || []).map((address) => ({
      addressType: address.addressType,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      primary: address.primary,
      latitude: address.latitude,
      longitude: address.longitude
    }));
    const primaryAddress = addresses.find((address) => address.primary) || addresses[0] || null;
    return {
      providerUniqueId: p.uniqueId,
      providerName: p.name,
      contactPerson: p.name,
      phone: p.phoneNumber,
      email: p.email,
      availability: p.availabilityStatus,
      address: primaryAddress ? [primaryAddress.addressLine1, primaryAddress.addressLine2, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode].filter(Boolean).join(', ') : '',
      latitude: primaryAddress?.latitude,
      longitude: primaryAddress?.longitude,
      primaryAddress,
      addresses,
      providerServices: (p.providerServices || []).map((item) => ({
        service: item.service,
        status: item.status,
        startDate: item.startDate,
        endDate: item.endDate,
        uniqueId: item.uniqueId
      })),
      services: (p.providerServices || []).map(s => s.service),
      reviews: []
    };
  },

  createProvider: async (providerPayload) => {
    const res = await axiosInstance.post('/providers', providerPayload);
    return res.data;
  },

  updatePrimaryAddress: async (providerUniqueId, address) => {
    const res = await axiosInstance.put(`/providers/unique/${providerUniqueId}/address`, {
      addressType: address.addressType || 'SERVICE',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      postalCode: address.postalCode,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
      primary: true
    });
    return res.data;
  },

  addProviderService: async (providerUniqueId, service) => {
    const res = await axiosInstance.post(`/providers/unique/${providerUniqueId}/services`, {
      service,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE'
    });
    return res.data;
  },

  getCatalogueGuidance: async (providerUniqueId) => {
    const res = await axiosInstance.get('/guidance/catalogue', {
      params: { providerUniqueId }
    });
    return res.data || [];
  },

  getServiceGuidance: async (serviceUniqueId, providerUniqueId) => {
    const res = await axiosInstance.get(`/guidance/${serviceUniqueId}`, {
      params: { providerUniqueId }
    });
    return res.data;
  },

  submitServiceApplication: async (providerUniqueId, payload) => {
    const res = await axiosInstance.post('/provider/service-applications', payload, {
      params: { providerUniqueId }
    });
    return res.data;
  },

  getMyApplications: async (providerUniqueId) => {
    const res = await axiosInstance.get('/provider/service-applications/my', {
      params: { providerUniqueId }
    });
    return res.data || [];
  },

  getNearbyProviders: async ({ latitude, longitude, radiusKm = 25, serviceType } = {}) => {
    const origin = { latitude: Number(latitude), longitude: Number(longitude) };
    if (!Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude)) return [];
    const providers = await providerApi.getAllProviders();
    return providers
      .map((provider) => ({ ...provider, distance: distanceBetween(origin, provider) }))
      .filter((provider) => Number.isFinite(provider.distance)
        && provider.distance <= radiusKm
        && (!serviceType || provider.services.some((service) => normalizeServiceType(service) === normalizeServiceType(serviceType))))
      .sort((a, b) => a.distance - b.distance);
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
  },

  getSchedule: async (providerUniqueId) => {
    const res = await axiosInstance.get(`/providers/unique/${providerUniqueId}/schedule`);
    return res.data;
  },

  saveSchedule: async (providerUniqueId, scheduleList) => {
    const res = await axiosInstance.post(`/providers/unique/${providerUniqueId}/schedule`, scheduleList);
    return res.data;
  }
};

function distanceBetween(origin, provider) {
  if (![origin.latitude, origin.longitude, provider.latitude, provider.longitude].every(Number.isFinite)) return null;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latDelta = toRadians(provider.latitude - origin.latitude);
  const lngDelta = toRadians(provider.longitude - origin.longitude);
  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(toRadians(origin.latitude)) * Math.cos(toRadians(provider.latitude)) * Math.sin(lngDelta / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}

function normalizeServiceType(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}
