import mongoose from 'mongoose';
import User from '../models/User';
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
