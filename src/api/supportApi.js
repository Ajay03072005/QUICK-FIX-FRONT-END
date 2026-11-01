import axiosInstance from './axiosInstance';

export const supportApi = {
  createTicket: async (ticketPayload) => {
    const res = await axiosInstance.post('/support/tickets', ticketPayload);
    return res.data;
  },

  getAllTickets: async () => {
    const res = await axiosInstance.get('/support/tickets');
    return res.data || [];
  },

  getTicketById: async (uniqueId) => {
    const res = await axiosInstance.get(`/support/tickets/${uniqueId}`);
    return res.data;
  },

  getTicketMessages: async (uniqueId) => {
    const res = await axiosInstance.get(`/support/tickets/${uniqueId}/messages`);
    return res.data || [];
  },

  addMessage: async (uniqueId, messageData) => {
    const res = await axiosInstance.post(`/support/tickets/${uniqueId}/messages`, messageData);
    return res.data;
  },

  updateTicketStatus: async (uniqueId, status, resolutionNotes) => {
    const res = await axiosInstance.put(`/support/tickets/${uniqueId}/status`, null, {
      params: { status, resolutionNotes }
    });
    return res.data;
  }
};
