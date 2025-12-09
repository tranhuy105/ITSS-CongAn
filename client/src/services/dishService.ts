import api from './api';

interface GetDishesParams {
  page?: number;
  limit?: number;
  category?: string;
  region?: string;
  search?: string;
}

// feature for end user
export const getDishes = async (params: GetDishesParams = {}) => {
  const response = await api.get('/dishes', { params });
  return response.data.data;
};

export const getDishById = async (id: string) => {
  const response = await api.get(`/dishes/${id}`);
  return response.data.data;
};

// feature for admin
export const getDishesAdmin = async (params: GetDishesParams = {}) => {
  const response = await api.get('/dishes/admin', { params });
  return response.data.data;
};

export const getUnassignedDishesList = async (searchQuery?: string) => {
  const response = await api.get('/dishes/unassigned-list', { params: { search: searchQuery } });
  return response.data.data;
};

export const getDishByIdAdmin = async (id: string) => {
  const response = await api.get(`/dishes/${id}/admin`);
  return response.data.data;
};

export const createDish = async (data: any) => {
  const response = await api.post('/dishes', data);
  return response.data.data.dish;
};

export const updateDish = async (id: string, data: any) => {
  const response = await api.put(`/dishes/${id}`, data);
  return response.data.data.dish;
};

export const deleteDish = async (id: string) => {
  await api.delete(`/dishes/${id}`);
  return { message: 'Dish soft-deleted successfully' };
};

export const restoreDish = async (id: string) => {
  await api.post(`/dishes/${id}/restore`);
  return { message: 'Dish restored successfully' };
};

export const uploadDishImages = async (formData: FormData) => {
  const response = await api.post('/dishes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data.images;
};
