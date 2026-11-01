import axiosInstance from './axiosInstance';

export const reviewApi = {
  createReview: async (customerUniqueId, reviewData) => {
    const res = await axiosInstance.post('/reviews', reviewData, {
      params: { customerUniqueId }
    });
    return res.data;
  },

  getProviderReviews: async (providerUniqueId) => {
    const res = await axiosInstance.get(`/reviews/provider/${providerUniqueId}`);
    return res.data || [];
  },

  getCustomerReviews: async (customerUniqueId) => {
    const res = await axiosInstance.get(`/reviews/customer/${customerUniqueId}`);
    return res.data || [];
  }
};
