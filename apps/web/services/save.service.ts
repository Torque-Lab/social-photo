import api from './api';

const SaveService = {
  /**
   * Save a photo
   */
  savePhoto: async (photoId: string) => {
    const response = await api.post(`/api/saves/${photoId}`);
    return response.data;
  },

  /**
   * Unsave a photo
   */
  unsavePhoto: async (photoId: string) => {
    const response = await api.delete(`/api/saves/${photoId}`);
    return response.data;
  },

  /**
   * Check if the current user has saved a photo
   */
  checkSave: async (photoId: string) => {
    const response = await api.get(`/api/saves/${photoId}/check`);
    return response.data;
  },
};

export default SaveService;
