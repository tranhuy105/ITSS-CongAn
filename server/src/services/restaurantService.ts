import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant';
import { Dish } from '@/models';

interface GetRestaurantsParams {
  page?: number;
  limit?: number;
  dishId?: string;
  search?: string;
  sortBy?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  minRating?: number;
  maxRating?: number;
}

// feature for end user
export const getRestaurants = async (params: GetRestaurantsParams) => {
  const {
    page = 1,
    limit = 12,
    dishId,
    search,
    sortBy = '-createdAt',
    latitude,
    longitude,
    maxDistance = 10000,
    minRating,
    maxRating,
  } = params;

  const query: any = { deletedAt: null };

  // Filter by dish
  if (dishId) {
    query.dishes = new mongoose.Types.ObjectId(dishId);
  }

  // Search by name
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // Rating filter implementation
  if (minRating !== undefined || maxRating !== undefined) {
    query.averageRating = {};
    if (minRating !== undefined) {
      query.averageRating.$gte = minRating;
    }
    if (maxRating !== undefined) {
      query.averageRating.$lte = maxRating;
    }
  }

  const skip = (page - 1) * limit;

  // Geospatial filter (within radius) if coordinates provided.
  // Note: maxDistance is in meters. For $centerSphere radius is in radians.
  if (latitude !== undefined && longitude !== undefined) {
    const earthRadiusMeters = 6378100;
    const safeMaxDistance = Number.isFinite(maxDistance) && maxDistance > 0 ? maxDistance : 10000;
    query.location = {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], safeMaxDistance / earthRadiusMeters],
      },
    };
  }

  const restaurantsQuery = Restaurant.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate('dishes', 'name images category')
    .lean();

  const [restaurants, total] = await Promise.all([restaurantsQuery, Restaurant.countDocuments(query)]);

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
    .where({ deletedAt: null })
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

// feature for admin
// Helper function to validate dishes are active
const validateActiveDishes = async (dishIds: string[]) => {
  if (!dishIds || dishIds.length === 0) return [];

  const activeDishes = await Dish.find({
    _id: { $in: dishIds },
    deletedAt: null,
  })
    .select('_id')
    .lean();

  if (activeDishes.length !== dishIds.length) {
    const foundIds = activeDishes.map((d) => d._id.toString());
    const invalidIds = dishIds.filter((id) => !foundIds.includes(id));
    throw new Error(`One or more dishes are inactive or not found: ${invalidIds.join(', ')}`);
  }
  // Trả về ObjectIds
  return activeDishes.map((d) => d._id);
};

export const getRestaurantsAdmin = async (params: GetRestaurantsParams) => {
  const { page = 1, limit = 12, dishId, search, sortBy = '-createdAt' } = params;

  const query: any = {};

  if (dishId) {
    query.dishes = new mongoose.Types.ObjectId(dishId);
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const restaurantsQuery = Restaurant.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate('dishes', 'name images category')
    .lean();

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

export const getRestaurantByIdAdmin = async (id: string) => {
  const restaurant = await Restaurant.findById(id)
    .populate('dishes', 'name description images category region averageRating')
    .lean();

  if (!restaurant) {
    throw new Error('Restaurant not found (Admin)');
  }
  return restaurant;
};

export const createRestaurant = async (data: any) => {
  if (data.dishes && data.dishes.length > 0) {
    data.dishes = await validateActiveDishes(data.dishes);
  }
  const restaurant = await Restaurant.create(data);
  return restaurant;
};

export const updateRestaurant = async (id: string, data: any) => {
  if (data.dishes && data.dishes.length > 0) {
    data.dishes = await validateActiveDishes(data.dishes);
  }
  const restaurant = await Restaurant.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }
  return restaurant;
};

export const deleteRestaurant = async (id: string) => {
  const restaurant = await Restaurant.findByIdAndDelete(id);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }
  return restaurant;
};

