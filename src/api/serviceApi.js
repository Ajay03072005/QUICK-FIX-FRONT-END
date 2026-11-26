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
        return res.data.map(srv => {
          const startingPrice = Number(srv.serviceCharge) || 0;
          const pricingModel = srv.pricingModel || 'FIXED';
          return {
            id: srv.id,
            uniqueId: srv.uniqueId,
            categoryId: srv.serviceType,
            categoryName: String(srv.serviceType || 'Service').replaceAll('_', ' '),
            name: String(srv.serviceType || 'Service').replaceAll('_', ' '),
            pricingModel: pricingModel,
            shortDescription: srv.description || 'Professional home service provided by verified local experts.',
            longDescription: srv.description || 'Professional home service provided by verified local experts.',
            startingPrice: startingPrice,
            rating: 4.8,
            reviewCount: 24,
            estimatedDuration: '45 - 60 mins',
            baseDistanceCharge: 30,
            included: DEFAULT_INCLUDED,
            excluded: DEFAULT_EXCLUDED
          };
        });
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
      const startingPrice = Number(data.serviceCharge) || 0;
      const pricingModel = data.pricingModel || 'FIXED';
      return {
        id: data.id,
        uniqueId: data.uniqueId || uniqueId,
        categoryId: data.serviceType,
        categoryName: String(data.serviceType || 'Service').replaceAll('_', ' '),
        name: String(data.serviceType || 'Service').replaceAll('_', ' '),
        pricingModel: pricingModel,
        shortDescription: data.description || 'Professional home service provided by verified local experts.',
        longDescription: data.description || 'Professional home service provided by verified local experts.',
        startingPrice: startingPrice,
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
  },

  getPricingConfig: async (uniqueId) => {
    try {
      const res = await axiosInstance.get(`/services/${uniqueId}/pricing`);
      return res.data;
    } catch (e) {
      console.error('Failed to get service pricing config:', e);
      throw e;
    }
  },

  calculatePrice: async (payload) => {
    try {
      const res = await axiosInstance.post('/services/calculate-price', payload);
      return res.data;
    } catch (e) {
      console.error('Price calculation error:', e);
      throw e;
    }
  }
};
