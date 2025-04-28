import api from './api';

const FollowService = {
  /**
   * Follow a user
   */
  followUser: async (username: string) => {
    const response = await api.post(`/api/follows/${username}`);
    return response.data;
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (username: string) => {
    const response = await api.delete(`/api/follows/${username}`);
    return response.data;
  },

  /**
   * Check if the current user follows another user
   */
  checkFollow: async (username: string) => {
    const response = await api.get(`/api/follows/${username}/check`);
    return response.data;
  },

  /**
   * Get a user's followers
   */
  getUserFollowers: async (username: string) => {
    const response = await api.get(`/api/follows/${username}/followers`);
    return response.data;
  },

  /**
   * Get users that a user is following
   */
  getUserFollowing: async (username: string) => {
    const response = await api.get(`/api/follows/${username}/following`);
    return response.data;
  },
};

export default FollowService;
