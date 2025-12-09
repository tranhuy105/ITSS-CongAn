import { Restaurant } from '@/models';
import Dish from '../models/Dish';

interface GetDishesParams {
  page?: number;
  limit?: number;
  category?: string;
  region?: string;
  search?: string;
  sortBy?: string;
}

// feature for end user
export const getDishes = async (params: GetDishesParams) => {
  const { page = 1, limit = 12, category, region, search, sortBy = '-createdAt' } = params;

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

export const getUnassignedActiveDishes = async (searchQuery?: string) => {
  const assignedDishIdsResult = await Restaurant.aggregate([
    { $unwind: '$dishes' },
    { $group: { _id: '$dishes' } },
  ]);

  const assignedIds = assignedDishIdsResult.map((item) => item._id);

  // 2. Xây dựng Query cho các món ăn chưa được gán và đang hoạt động
  const query: any = {
    _id: { $nin: assignedIds }, // $nin (not in)
    deletedAt: null, // đang hoạt động
  };

  if (searchQuery) {
    // Thêm search vào query
    query.$or = [
      { 'name.ja': { $regex: searchQuery, $options: 'i' } },
      { 'name.vi': { $regex: searchQuery, $options: 'i' } },
    ];
  }

  const unassignedDishes = await Dish.find(query).select('_id name category').lean();

  return { dishes: unassignedDishes };
};

export const getDishByIdAdmin = async (id: string) => {
  const dish = await Dish.findById(id).select('-history').lean();

  if (!dish) {
    throw new Error('Dish not found (Admin)');
  }

  return dish;
};

export const restoreDish = async (id: string) => {
  const dish = await Dish.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null },
    { new: true }
  );

  if (!dish) {
    throw new Error('Dish not found or already active');
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
  const dish = await Dish.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

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
