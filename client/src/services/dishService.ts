import api from './api';

interface GetDishesParams {
    page?: number;
    limit?: number;
    category?: string;
    region?: string;
    search?: string;
}

export const getDishes = async (params: GetDishesParams = {}) => {
    const response = await api.get('/dishes', { params });
    return response.data.data;
};

export const getDishById = async (id: string) => {
    const response = await api.get(`/dishes/${id}`);
    return response.data.data;
};
