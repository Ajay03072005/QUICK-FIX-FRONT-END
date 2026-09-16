import axiosInstance from './axiosInstance';

export const serviceApi = {
  getCategories: async () => {
    const services = await serviceApi.getAllServices();
    return [...new Map(services.map(service => [service.categoryId, {
      id: service.categoryId,
      name: service.categoryName,
      count: services.filter(item => item.categoryId === service.categoryId).length
    }])).values()];
  },

  getAllServices: async () => {
    try {
      const res = await axiosInstance.get('/services');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(srv => ({
          uniqueId: srv.uniqueId,
          categoryId: srv.serviceType,
          categoryName: String(srv.serviceType).replaceAll('_', ' '),
          name: String(srv.serviceType).replaceAll('_', ' '),
          shortDescription: srv.description,
          longDescription: srv.description,
          startingPrice: srv.serviceCharge
        }));
      }
    } catch (e) {
      throw new Error('Unable to load services from the database', { cause: e });
    }
  },

  getServiceById: async (uniqueId) => {
    try {
      const res = await axiosInstance.get(`/services/${uniqueId}`);
      return {
        uniqueId: res.data.uniqueId,
        categoryId: res.data.serviceType,
        categoryName: String(res.data.serviceType).replaceAll('_', ' '),
        name: String(res.data.serviceType).replaceAll('_', ' '),
        shortDescription: res.data.description,
        longDescription: res.data.description,
        startingPrice: res.data.serviceCharge
      };
    } catch (error) {
      throw new Error('Unable to load service from the database', { cause: error });
    }
  }
};
