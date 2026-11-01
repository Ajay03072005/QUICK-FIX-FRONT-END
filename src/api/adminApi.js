import axiosInstance from './axiosInstance';

export const adminApi = {
  getAuditLogs: async () => {
    const res = await axiosInstance.get('/admin/audit-logs');
    return res.data || [];
  },

  logAction: async ({ actor, action, targetType, targetId, reason }) => {
    const res = await axiosInstance.post('/admin/audit-logs', null, {
      params: { actor, action, targetType, targetId, reason }
    });
    return res.data;
  },

  getAllProviders: async () => {
    const res = await axiosInstance.get('/providers');
    return res.data || [];
  },

  updateDocumentStatus: async (documentId, status) => {
    const res = await axiosInstance.put(`/providers/documents/${documentId}/status`, null, {
      params: { status }
    });
    return res.data;
  },

  getAllBookings: async () => {
    const res = await axiosInstance.get('/bookings');
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
  }
};
