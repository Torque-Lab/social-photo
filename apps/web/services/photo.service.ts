import api from './api';

export interface PhotoData {
  title: string;
  description: string;
  tags: string[];
  photo?: File;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

const PhotoService = {
  /**
   * Create a new photo
   */
  createPhoto: async (data: PhotoData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', JSON.stringify(data.tags));
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await api.post('/api/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all photos with pagination
   */
  getAllPhotos: async (params: PaginationParams = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/api/photos?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get photos by tag with pagination
   */
  getPhotosByTag: async (tag: string, params: PaginationParams = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/api/photos/tag/${tag}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get photos by user with pagination
   */
  getPhotosByUser: async (username: string, params: PaginationParams = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get(`/api/photos/user/${username}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get a specific photo by ID
   */
  getPhotoById: async (id: string) => {
    const response = await api.get(`/api/photos/${id}`);
    return response.data;
  },

  /**
   * Update a photo
   */
  updatePhoto: async (id: string, data: PhotoData) => {
    const response = await api.put(`/api/photos/${id}`, data);
    return response.data;
  },

  /**
   * Delete a photo
   */
  deletePhoto: async (id: string) => {
    const response = await api.delete(`/api/photos/${id}`);
    return response.data;
  },
};

export default PhotoService;
