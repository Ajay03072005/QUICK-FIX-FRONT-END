import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const isProvider = credentials.role === 'PROVIDER';
    if (!isProvider) {
      const res = await axiosInstance.post('/customers/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      // Fetch customer profile from DB
      const customerProfile = await axiosInstance.get(`/customers/${res.data.customerUniqueId}`);
      const profile = customerProfile.data;

      return {
        token: 'session-token',
        role: 'CUSTOMER',
        user: {
          id: res.data.id,
          customerId: res.data.customerId,
          customerUniqueId: res.data.customerUniqueId,
          email: res.data.email,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
          phone: profile.phoneNumber,
          avatar: profile.profileImage
        }
      };
    } else {
      const providers = await axiosInstance.get('/providers');
      const provider = providers.data.find(item => item.email === credentials.email);
      if (!provider) throw new Error('Invalid provider email or password');
      return {
        token: 'provider-session-token',
        role: 'PROVIDER',
        user: {
          providerUniqueId: provider.uniqueId,
          id: provider.id,
          providerName: provider.name,
          email: provider.email,
          phone: provider.phoneNumber,
          availability: provider.availabilityStatus
        }
      };
    }
  },

  registerCustomer: async (customerData) => {
    const nameParts = (customerData.name || '').trim().split(' ');
    const payload = {
      email: customerData.email,
      password: customerData.password,
      firstName: nameParts[0] || 'Customer',
      lastName: nameParts.slice(1).join(' ') || '',
      phoneNumber: customerData.phone || '+919876543210',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      gender: 'MALE',
      dateOfBirth: '1998-01-01'
    };
    await axiosInstance.post('/customers/auth/register', payload);
    return authApi.login({ ...customerData, role: 'CUSTOMER' });
  },

  registerProvider: async (providerData) => {
    const payload = {
      name: providerData.name,
      phoneNumber: providerData.phone,
      email: providerData.email,
      providerServices: [],
      addresses: [],
      documents: [],
      contacts: []
    };
    const res = await axiosInstance.post('/providers', payload);
    return {
      success: true,
      message: res.data
    };
  }
};
