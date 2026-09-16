import axiosInstance from './axiosInstance';

export const customerApi = {
  getCustomerProfile: async (customerUniqueId) => {
    const res = await axiosInstance.get(`/customers/${customerUniqueId}`);
    return {
      id: res.data.id,
      customerUniqueId: res.data.uniqueId,
      name: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim(),
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      phone: res.data.phoneNumber,
      profileImage: res.data.profileImage,
      gender: res.data.gender,
      status: res.data.status,
      dateOfBirth: res.data.dateOfBirth
    };
  },

  getSavedAddresses: async (customerUniqueId) => {
    const res = await axiosInstance.get(`/customers/${customerUniqueId}/addresses`);
    return (res.data || []).map((addr) => ({
      id: addr.uniqueId || String(addr.id),
      uniqueId: addr.uniqueId,
      numericId: addr.id,
      label: addr.addressType || 'HOME',
      type: addr.addressType || 'HOME',
      isDefault: addr.defaultAddress,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.postalCode,
      latitude: addr.latitude,
      longitude: addr.longitude
    }));
  },

  addSavedAddress: async (customerUniqueId, addressData) => {
    let typeVal = (addressData.type || addressData.label || 'HOME').toUpperCase();
    if (typeVal !== 'HOME' && typeVal !== 'OFFICE') {
      typeVal = 'OTHER';
    }

    const payload = {
      addressType: typeVal,
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2 || '',
      city: addressData.city || 'Coimbatore',
      state: addressData.state || 'Tamil Nadu',
      country: 'India',
      postalCode: addressData.postalCode || '641002',
      latitude: addressData.latitude || 11.0125,
      longitude: addressData.longitude || 76.9515,
      defaultAddress: addressData.isDefault || false
    };

    const res = await axiosInstance.post(`/customers/${customerUniqueId}/addresses`, payload);
    return {
      id: res.data.uniqueId || String(res.data.id),
      uniqueId: res.data.uniqueId,
      label: res.data.addressType,
      type: res.data.addressType,
      isDefault: res.data.defaultAddress,
      addressLine1: res.data.addressLine1,
      addressLine2: res.data.addressLine2,
      city: res.data.city,
      state: res.data.state,
      postalCode: res.data.postalCode,
      latitude: res.data.latitude,
      longitude: res.data.longitude
    };
  },

  deleteSavedAddress: async (customerUniqueId, addressUniqueId) => {
    await axiosInstance.delete(`/customers/${customerUniqueId}/addresses/${addressUniqueId}`);
    return true;
  },

  getNotifications: async (customerUniqueId) => {
    const res = await axiosInstance.get(`/bookings/customer/${customerUniqueId}`);
    return (res.data || []).map((booking) => ({
      id: booking.uniqueId,
      title: `Booking ${booking.status}`,
      message: `${booking.serviceName} scheduled for ${booking.bookingDate} at ${booking.bookingTime}.`,
      timestamp: booking.bookingDate,
      link: `/customer/bookings/${booking.uniqueId}/track`
    }));
  }
};
