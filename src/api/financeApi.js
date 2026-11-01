import axiosInstance from './axiosInstance';

export const financeApi = {
  getProviderEarnings: async (providerUniqueId) => {
    const res = await axiosInstance.get(`/finance/provider/${providerUniqueId}/earnings`);
    return res.data || [];
  },

  getProviderLedger: async (providerUniqueId) => {
    const res = await axiosInstance.get(`/finance/provider/${providerUniqueId}/ledger`);
    return res.data || [];
  },

  getAllLedgerEntries: async () => {
    const res = await axiosInstance.get('/finance/ledger');
    return res.data || [];
  },

  createPayout: async (providerUniqueId, amount) => {
    const res = await axiosInstance.post(`/finance/provider/${providerUniqueId}/payouts`, null, {
      params: { amount }
    });
    return res.data;
  },

  getProviderPayouts: async (providerUniqueId) => {
    const res = await axiosInstance.get(`/finance/provider/${providerUniqueId}/payouts`);
    return res.data || [];
  }
};
