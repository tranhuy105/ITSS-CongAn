import api from './api';

interface GetRestaurantsParams {
  page?: number;
  limit?: number;
  dishId?: string;
  search?: string;
  sortBy?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
}

// feature for end user
export const getRestaurants = async (params: GetRestaurantsParams = {}) => {
  const response = await api.get('/restaurants', { params });
  return response.data.data;
};

export const getRestaurantById = async (id: string) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data.data;
};

export const getRestaurantsByDish = async (dishId: string) => {
  const response = await api.get(`/restaurants/dish/${dishId}`);
  return response.data.data;
};

// feature for admin
export const getRestaurantsAdmin = async (params: GetRestaurantsParams = {}) => {
  const response = await api.get('/admin/restaurants', { params });
  return response.data.data;
};

export const getRestaurantByIdAdmin = async (id: string) => {
  const response = await api.get(`/admin/restaurants/${id}`);
  return response.data.data;
};

export const restoreRestaurant = async (id: string) => {
  await api.post(`/admin/restaurants/${id}/restore`);
  return { message: 'Restaurant restored successfully' };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRestaurant = async (data: any) => {
  const response = await api.post('/admin/restaurants', data);
  return response.data.data.restaurant;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRestaurant = async (id: string, data: any) => {
  const response = await api.put(`/admin/restaurants/${id}`, data);
  return response.data.data.restaurant;
};

export const deleteRestaurant = async (id: string) => {
  await api.delete(`/admin/restaurants/${id}`);
  return { message: 'Restaurant soft-deleted successfully' };
};

export const uploadRestaurantImages = async (formData: FormData) => {
  const response = await api.post('/admin/restaurants/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data.images;
};
