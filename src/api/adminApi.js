import axiosInstance from './axiosInstance';

export const adminApi = {
  getAuditLogs: async () => {
    try {
      const res = await axiosInstance.get('/admin/audit-logs');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  logAction: async ({ actor, action, targetType, targetId, reason }) => {
    try {
      const res = await axiosInstance.post('/admin/audit-logs', null, {
        params: { actor, action, targetType, targetId, reason }
      });
      return res.data;
    } catch (e) {
      return null;
    }
  },

  getAllProviders: async () => {
    try {
      const res = await axiosInstance.get('/providers');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  updateDocumentStatus: async (documentId, status) => {
    const res = await axiosInstance.put(`/providers/documents/${documentId}/status`, null, {
      params: { status }
    });
    return res.data;
  },

  getAllBookings: async () => {
    try {
      const res = await axiosInstance.get('/bookings');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  getAllLedgerEntries: async () => {
    try {
      const res = await axiosInstance.get('/finance/ledger');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  createPayout: async (providerUniqueId, amount) => {
    const res = await axiosInstance.post(`/finance/provider/${providerUniqueId}/payouts`, null, {
      params: { amount }
    });
    return res.data;
  },

  getServiceApplications: async (status) => {
    try {
      const res = await axiosInstance.get('/admin/service-applications', {
        params: status ? { status } : {}
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  reviewServiceApplication: async (uniqueId, reviewPayload) => {
    const res = await axiosInstance.put(`/admin/service-applications/${uniqueId}/review`, reviewPayload);
    return res.data;
  },

  getServiceGuidance: async (serviceUniqueId) => {
    const res = await axiosInstance.get(`/admin/guidance/${serviceUniqueId}`);
    return res.data;
  },

  saveServiceGuidance: async (guidancePayload) => {
    const res = await axiosInstance.post('/admin/guidance', guidancePayload);
    return res.data;
  }
};
