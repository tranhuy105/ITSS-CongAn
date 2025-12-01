import api from './api';

interface CreateReviewData {
  dishId: string;
  rating: number;
  comment?: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

interface GetReviewsParams {
  page?: number;
  limit?: number;
}

/**
 * Get paginated list of reviews for a dish
 * GET /api/reviews/dish/:dishId?page=...&limit=...
 */
export const getReviewsByDish = async (dishId: string, params: GetReviewsParams = {}) => {
  const response = await api.get(`/reviews/dish/${dishId}`, { params });
  // data structure is { reviews: [], pagination: {} }
  return response.data.data;
};

/**
 * Create a new review
 * POST /api/reviews
 */
export const createReview = async (data: CreateReviewData) => {
  const response = await api.post('/reviews', data);
  return response.data.data.review;
};

/**
 * Update an existing review
 * PUT /api/reviews/:id
 */
export const updateReview = async (reviewId: string, data: UpdateReviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data.data.review;
};

/**
 * Soft delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (reviewId: string) => {
  await api.delete(`/reviews/${reviewId}`);
  return { message: 'Review deleted successfully' };
};
