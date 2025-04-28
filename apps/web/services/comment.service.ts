import api from './api';

export interface CommentData {
  content: string;
}

const CommentService = {
  /**
   * Create a new comment on a photo
   */
  createComment: async (photoId: string, data: CommentData) => {
    const response = await api.post(`/api/comments/${photoId}`, data);
    return response.data;
  },

  /**
   * Get all comments for a photo
   */
  getPhotoComments: async (photoId: string) => {
    const response = await api.get(`/api/comments/${photoId}`);
    return response.data;
  },

  /**
   * Update a comment
   */
  updateComment: async (commentId: string, data: CommentData) => {
    const response = await api.put(`/api/comments/${commentId}`, data);
    return response.data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/api/comments/${commentId}`);
    return response.data;
  },
};

export default CommentService;
