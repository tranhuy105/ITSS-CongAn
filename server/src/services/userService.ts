import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import Dish from '../models/Dish';

interface GetFavoritesParams {
  page?: number;
  limit?: number;
}

/**
 * Get paginated list of favorited dishes for the current user
 */
export const getFavorites = async (userId: string, params: GetFavoritesParams) => {
  const { page = 1, limit = 12 } = params;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find the user to get all favorite IDs
  const user = await User.findById(userObjectId).select('favorites').lean();
  if (!user) {
    throw new Error('User not found');
  }

  // Filter the user's favorites array against active dishes in the Dish collection
  const activeFavorites = await Dish.find({
    _id: { $in: user.favorites.map((fav) => fav.dish) },
    deletedAt: null,
  })
    .select('_id')
    .lean();

  const filteredFavorites = user.favorites
    .filter((fav) => activeFavorites.some((dish) => dish._id.equals(fav.dish)))
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());

  const total = filteredFavorites.length;
  const skip = (page - 1) * limit;

  // Slice the active favorite IDs based on pagination
  const paginatedFavorites = filteredFavorites.slice(skip, skip + limit);
  const paginatedDishIds = paginatedFavorites.map((fav) => fav.dish);

  // Fetch the actual Dish documents using the paginated IDs
  const favoriteDishes = await Dish.find({
    _id: { $in: paginatedDishIds },
  }).lean();

  favoriteDishes.sort((a, b) => {
    return (
      paginatedFavorites.findIndex((f) => f.dish.toString() === a._id.toString()) -
      paginatedFavorites.findIndex((f) => f.dish.toString() === b._id.toString())
    );
  });

  return {
    dishes: favoriteDishes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Add a dish to the user's favorites list (idempotent)
 */
export const addFavorite = async (userId: string, dishId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const dishObjectId = new mongoose.Types.ObjectId(dishId);

  // Check if dish exists
  const dishExists = await Dish.exists({ _id: dishObjectId, deletedAt: null });
  if (!dishExists) {
    throw new Error('Dish not found or inactive');
  }

  // $addToSet ensures the dishId is added only if it's not already present (idempotent)
  const newFavoriteEntry = { dish: dishObjectId, addedAt: new Date() };
  const result = await User.updateOne(
    { _id: userObjectId, 'favorites.dish': { $ne: dishObjectId } },
    { $push: { favorites: newFavoriteEntry } }
  );

  if (result.matchedCount === 0) {
    return { message: 'Dish already in favorites or User not found' };
  }

  return { message: 'Dish added to favorites' };
};

/**
 * Remove a dish from the user's favorites list
 */
export const removeFavorite = async (userId: string, dishId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const dishObjectId = new mongoose.Types.ObjectId(dishId);

  // $pull removes the dishId from the array if it exists
  const result = await User.updateOne(
    { _id: userObjectId },
    { $pull: { favorites: { dish: dishObjectId } } }
  );

  if (result.matchedCount === 0) {
    throw new Error('User not found');
  }

  return { message: 'Dish removed from favorites' };
};

/**
 * Check if a dish is in the user's favorites list
 */
export const checkIsFavorite = async (userId: string, dishId: string): Promise<boolean> => {
  const user = await User.findOne({
    _id: userId,
    'favorites.dish': new mongoose.Types.ObjectId(dishId),
  }).lean();

  return !!user;
};

// Admin functions
interface GetUsersAdminParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isLocked?: boolean;
  sortBy?: string;
}

/**
 * Get paginated list of users for admin
 */
export const getUsersAdmin = async (params: GetUsersAdminParams) => {
  const {
    page = 1,
    limit = 12,
    search,
    role,
    isLocked,
    sortBy = '-createdAt',
  } = params;

  const query: any = {};

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by lock status
  if (isLocked !== undefined) {
    query.isLocked = isLocked;
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: UserRole) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate role
  if (!Object.values(UserRole).includes(role)) {
    throw new Error('Invalid role');
  }

  user.role = role;
  await user.save();

  return user;
};

/**
 * Toggle user lock status
 */
export const toggleUserLock = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.isLocked = !user.isLocked;
  await user.save();

  return user;
};

interface CreateUserAdminInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isLocked?: boolean;
}

/**
 * Create a new user (Admin)
 */
export const createUserAdmin = async (input: CreateUserAdminInput) => {
  const { name, email, password, role = UserRole.GUEST, isLocked = false } = input;

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    isLocked,
  });

  return user;
};

/**
 * Get a user by id (Admin)
 */
export const getUserByIdAdmin = async (userId: string) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

interface UpdateUserAdminInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isLocked?: boolean;
}

/**
 * Update a user (Admin)
 */
export const updateUserAdmin = async (userId: string, input: UpdateUserAdminInput) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  if (input.email && input.email !== user.email) {
    const existing = await User.findOne({ email: input.email }).lean();
    if (existing) {
      throw new Error('Email already registered');
    }
    user.email = input.email;
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  if (input.role !== undefined) {
    if (!Object.values(UserRole).includes(input.role)) {
      throw new Error('Invalid role');
    }
    user.role = input.role;
  }

  if (input.isLocked !== undefined) {
    user.isLocked = input.isLocked;
  }

  if (input.password) {
    user.password = input.password; // will be hashed by pre-save hook
  }

  await user.save();
  return user.toJSON();
};

/**
 * Delete a user (Admin) - hard delete
 */
export const deleteUserAdmin = async (userId: string) => {
  const result = await User.deleteOne({ _id: userId });
  if (result.deletedCount === 0) {
    throw new Error('User not found');
  }
  return { message: 'User deleted successfully' };
};
