import api from './api';

const LikeService = {
  /**
   * Like a photo
   */
  likePhoto: async (photoId: string) => {
    const response = await api.post(`/api/likes/${photoId}`);
    return response.data;
  },

  /**
   * Unlike a photo
   */
  unlikePhoto: async (photoId: string) => {
    const response = await api.delete(`/api/likes/${photoId}`);
    return response.data;
  },

  /**
   * Check if the current user has liked a photo
   */
  checkLike: async (photoId: string) => {
    const response = await api.get(`/api/likes/${photoId}/check`);
    return response.data;
  },

  /**
   * Get users who liked a photo
   */
  getLikedUsers: async (photoId: string) => {
    const response = await api.get(`/api/likes/${photoId}/users`);
    return response.data;
  },
};

export default LikeService;
