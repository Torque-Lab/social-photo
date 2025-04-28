import api from './api';

export interface UserUpdateData {
  name?: string;
  bio?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

const UserService = {
  /**
   * Get the current logged-in user's profile
   */
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  /**
   * Get a user by username
   */
  getUserByUsername: async (username: string) => {
    const response = await api.get(`/api/users/${username}`);
    return response.data;
  },

  /**
   * Update the current user's profile
   */
  updateUser: async (data: UserUpdateData) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  },

  /**
   * Update the current user's profile image
   */
  updateUserImage: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.put('/api/users/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get the current user's saved photos
   */
  getSavedPhotos: async (params: PaginationParams = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/api/users/me/saved?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default UserService;
