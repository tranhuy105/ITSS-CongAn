import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant';

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

export const getRestaurants = async (params: GetRestaurantsParams) => {
    const {
        page = 1,
        limit = 12,
        dishId,
        search,
        sortBy = '-createdAt',
        latitude,
        longitude,
        maxDistance = 10000, // 10km default
    } = params;

    const query: any = {};

    // Filter by dish
    if (dishId) {
        query.dishes = new mongoose.Types.ObjectId(dishId);
    }

    // Search by name
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    let restaurantsQuery;

    // Geospatial query if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
        restaurantsQuery = Restaurant.find(query)
            .where('location')
            .near({
                center: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                maxDistance,
            })
            .skip(skip)
            .limit(limit)
            .populate('dishes', 'name images category')
            .lean();
    } else {
        restaurantsQuery = Restaurant.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .populate('dishes', 'name images category')
            .lean();
    }

    const [restaurants, total] = await Promise.all([
        restaurantsQuery,
        Restaurant.countDocuments(query),
    ]);

    return {
        restaurants,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getRestaurantById = async (id: string) => {
    const restaurant = await Restaurant.findById(id)
        .populate('dishes', 'name description images category region averageRating')
        .lean();

    if (!restaurant) {
        throw new Error('Restaurant not found');
    }

    return restaurant;
};

export const getRestaurantsByDish = async (dishId: string) => {
    const restaurants = await Restaurant.find({
        dishes: new mongoose.Types.ObjectId(dishId),
    })
        .populate('dishes', 'name images category')
        .lean();

    return restaurants;
};
