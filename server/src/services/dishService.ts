import { Restaurant } from '@/models';
import Dish from '../models/Dish';

interface GetDishesParams {
  page?: number;
  limit?: number;
  category?: string;
  region?: string;
  search?: string;
  sortBy?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
}

// feature for end user
export const getDishes = async (params: GetDishesParams) => {
  const {
    page = 1,
    limit = 12,
    category,
    region,
    search,
    sortBy = '-createdAt',
    minRating,
    maxRating,
    minPrice,
    maxPrice,
  } = params;

  const query: any = { deletedAt: null };

  if (category) {
    query.category = category;
  }

  if (region) {
    query.region = region;
  }

  if (search) {
    query.$or = [
      { 'name.ja': { $regex: search, $options: 'i' } },
      { 'name.vi': { $regex: search, $options: 'i' } },
    ];
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

  // Price filter implementation
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: any[] = [];

    // Điều kiện 1: D.minPrice <= F.maxPrice
    if (maxPrice !== undefined) {
      priceFilter.push({ minPrice: { $lte: maxPrice } });
    }

    // Điều kiện 2: D.maxPrice >= F.minPrice
    if (minPrice !== undefined) {
      priceFilter.push({ maxPrice: { $gte: minPrice } });
    }

    if (priceFilter.length > 0) {
      // Sử dụng $and để kết hợp cả hai điều kiện giao nhau
      query.$and = (query.$and || []).concat(priceFilter);
    }
  }

  const skip = (page - 1) * limit;

  const [dishes, total] = await Promise.all([
    Dish.find(query).sort(sortBy).skip(skip).limit(limit).select('-history').lean(),
    Dish.countDocuments(query),
  ]);

  return {
    dishes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDishById = async (id: string) => {
  const dish = await Dish.findById(id).where({ deletedAt: null }).select('-history').lean();

  if (!dish) {
    throw new Error('Dish not found');
  }

  return dish;
};

// feature for admin
export const getDishesAdmin = async (params: GetDishesParams) => {
  const { page = 1, limit = 12, category, region, search, sortBy = '-updatedAt' } = params;

  const query: any = {};

  if (category) {
    query.category = category;
  }

  if (region) {
    query.region = region;
  }

  if (search) {
    query.$or = [
      { 'name.ja': { $regex: search, $options: 'i' } },
      { 'name.vi': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [dishes, total] = await Promise.all([
    Dish.find(query).sort(sortBy).skip(skip).limit(limit).lean(),
    Dish.countDocuments(query),
  ]);

  return {
    dishes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllActiveDishesForAssignment = async (searchQuery?: string) => {
  const query: any = {
    deletedAt: null,
  };

  if (searchQuery) {
    query.$or = [
      { 'name.ja': { $regex: searchQuery, $options: 'i' } },
      { 'name.vi': { $regex: searchQuery, $options: 'i' } },
    ];
  }

  const activeDishes = await Dish.find(query).select('_id name category').lean();

  return { dishes: activeDishes };
};

export const getDishesByRestaurantId = async (restaurantId: string) => {
  // 1. Find the restaurant and get its dish IDs
  const restaurant = await Restaurant.findById(restaurantId).select('dishes').lean();

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const assignedDishIds = restaurant.dishes;

  // 2. Fetch the actual Dish documents, ensuring they are ACTIVE (deletedAt: null)
  const dishes = await Dish.find({
    _id: { $in: assignedDishIds },
    deletedAt: null, // Chỉ lấy các món ăn đang hoạt động
  })
    .select('_id name category')
    .lean(); // Select necessary fields for assignment form

  return { dishes };
};

export const getDishByIdAdmin = async (id: string) => {
  const dish = await Dish.findById(id).select('-history').lean();

  if (!dish) {
    throw new Error('Dish not found (Admin)');
  }

  return dish;
};


export const createDish = async (dishData: any) => {
  const dish = await Dish.create(dishData);
  return dish;
};

export const updateDish = async (id: string, dishData: any, adminId: string) => {
  const dish = await Dish.findById(id);

  if (!dish) {
    throw new Error('Dish not found');
  }

  // Save current state to history
  dish.history.push({
    version: dish.history.length + 1,
    data: dish.toObject(),
    modifiedBy: adminId as any,
    modifiedAt: new Date(),
  });

  // Update dish
  Object.assign(dish, dishData);
  await dish.save();

  return dish;
};

export const deleteDish = async (id: string) => {
  const dish = await Dish.findByIdAndDelete(id);

  if (!dish) {
    throw new Error('Dish not found');
  }

  return dish;
};

export const getDishHistory = async (id: string) => {
  const dish = await Dish.findById(id).select('history').lean();

  if (!dish) {
    throw new Error('Dish not found');
  }

  return dish.history;
};

export const revertDishToVersion = async (id: string, version: number, adminId: string) => {
  const dish = await Dish.findById(id);

  if (!dish) {
    throw new Error('Dish not found');
  }

  const historyEntry = dish.history.find((h) => h.version === version);

  if (!historyEntry) {
    throw new Error('Version not found');
  }

  // Save current state to history before reverting
  dish.history.push({
    version: dish.history.length + 1,
    data: dish.toObject(),
    modifiedBy: adminId as any,
    modifiedAt: new Date(),
  });

  // Revert to the specified version
  Object.assign(dish, historyEntry.data);
  await dish.save();

  return dish;
};
