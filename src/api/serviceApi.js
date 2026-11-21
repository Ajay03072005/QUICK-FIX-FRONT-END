import axiosInstance from './axiosInstance';

const DEFAULT_INCLUDED = [
  'Verified technician visit at your doorstep',
  'Initial diagnostic and inspection check',
  'Standard tools and labor for service completion'
];

const DEFAULT_EXCLUDED = [
  'Cost of replacement parts or hardware materials',
  'Major structural modifications or extensive rewiring'
];

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
          categoryName: String(srv.serviceType || 'Service').replaceAll('_', ' '),
          name: String(srv.serviceType || 'Service').replaceAll('_', ' '),
          shortDescription: srv.description || 'Professional home service provided by verified local experts.',
          longDescription: srv.description || 'Professional home service provided by verified local experts.',
          startingPrice: Number(srv.serviceCharge) || 399,
          rating: 4.8,
          reviewCount: 24,
          estimatedDuration: '45 - 60 mins',
          baseDistanceCharge: 30,
          included: DEFAULT_INCLUDED,
          excluded: DEFAULT_EXCLUDED
        }));
      }
      return [];
    } catch (e) {
      throw new Error('Unable to load services from the database', { cause: e });
    }
  },

  getServiceById: async (uniqueId) => {
    try {
      const res = await axiosInstance.get(`/services/${uniqueId}`);
      const data = res.data || {};
      return {
        uniqueId: data.uniqueId || uniqueId,
        categoryId: data.serviceType,
        categoryName: String(data.serviceType || 'Service').replaceAll('_', ' '),
        name: String(data.serviceType || 'Service').replaceAll('_', ' '),
        shortDescription: data.description || 'Professional home service provided by verified local experts.',
        longDescription: data.description || 'Professional home service provided by verified local experts.',
        startingPrice: Number(data.serviceCharge) || 399,
        rating: 4.8,
        reviewCount: 24,
        estimatedDuration: '45 - 60 mins',
        baseDistanceCharge: 30,
        included: Array.isArray(data.included) && data.included.length > 0 ? data.included : DEFAULT_INCLUDED,
        excluded: Array.isArray(data.excluded) && data.excluded.length > 0 ? data.excluded : DEFAULT_EXCLUDED
      };
    } catch (error) {
      try {
        const all = await serviceApi.getAllServices();
        const found = all.find(s => s.uniqueId === uniqueId);
        if (found) return found;
      } catch (fallbackError) {
        // ignore
      }
      throw new Error('Unable to load service from the database', { cause: error });
    }
  }
};
