import api from './api';

interface GetFavoritesParams {
  page?: number;
  limit?: number;
}

/**
 * GET /api/users/favorites
 * Get paginated list of favorited dishes
 */
export const getFavorites = async (params: GetFavoritesParams = {}) => {
  const response = await api.get('/users/favorites', { params });
  return response.data.data;
};

/**
 * POST /api/users/favorites/:dishId
 * Add a dish to favorites
 */
export const addFavorite = async (dishId: string) => {
  await api.post(`/users/favorites/${dishId}`);
  return { message: 'Dish added to favorites' };
};

/**
 * DELETE /api/users/favorites/:dishId
 * Remove a dish from favorites
 */
export const removeFavorite = async (dishId: string) => {
  await api.delete(`/users/favorites/${dishId}`);
  return { message: 'Dish removed from favorites' };
};

/**
 * GET /api/users/favorites/:dishId
 * Check if a dish is currently favorited
 */
export const checkIsFavorite = async (dishId: string) => {
  const response = await api.get(`/users/favorites/${dishId}`);
  return response.data.data.isFavorite;
};
