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

// Admin functions
interface GetUsersAdminParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isLocked?: string;
  sortBy?: string;
}

/**
 * GET /api/admin/users
 * Get paginated list of users for admin
 */
export const getUsersAdmin = async (params: GetUsersAdminParams = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data.data;
};

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
export const updateUserRole = async (id: string, role: 'guest' | 'admin') => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data.data.user;
};

/**
 * PUT /api/admin/users/:id/lock
 * Toggle user lock status
 */
export const toggleUserLock = async (id: string) => {
  const response = await api.put(`/admin/users/${id}/lock`);
  return response.data.data.user;
};

interface CreateUserAdminPayload {
  name: string;
  email: string;
  password: string;
  role?: 'guest' | 'admin';
  isLocked?: boolean;
}

/**
 * POST /api/admin/users
 * Create a new user (Admin)
 */
export const createUserAdmin = async (data: CreateUserAdminPayload) => {
  const response = await api.post('/admin/users', data);
  return response.data.data.user;
};

export const getUserByIdAdmin = async (id: string) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data.data.user;
};

interface UpdateUserAdminPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: 'guest' | 'admin';
  isLocked?: boolean;
}

export const updateUserAdmin = async (id: string, data: UpdateUserAdminPayload) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data.data.user;
};

export const deleteUserAdmin = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data.data;
};
