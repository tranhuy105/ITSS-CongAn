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
