import mongoose from 'mongoose';
import Review from '../models/Review';
import { CreateReviewInput, UpdateReviewInput } from '../validators/review';

interface GetReviewsByDishParams {
  dishId: string;
  page?: number;
  limit?: number;
}

/**
 * Get paginated list of reviews for a specific dish
 * GET /api/reviews/dish/:dishId
 */
export const getReviewsByDish = async (params: GetReviewsByDishParams) => {
  const { dishId, page = 1, limit = 10 } = params;

  const dishObjectId = new mongoose.Types.ObjectId(dishId);

  // Query only includes non-soft-deleted reviews
  const query = { dish: dishObjectId, deletedAt: null };

  const [reviews, total] = await Promise.all([
    // Using static method from Review model
    Review.getReviewsByDish(dishObjectId, page, limit),
    Review.countDocuments(query),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create a new review
 * POST /api/reviews
 */
export const createReview = async (data: CreateReviewInput, userId: string) => {
  const dishId = new mongoose.Types.ObjectId(data.dishId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Check if user has already reviewed this dish (non-soft-deleted)
  const hasReviewed = await Review.hasUserReviewed(userObjectId, dishId);
  if (hasReviewed) {
    throw new Error('You have already reviewed this dish');
  }

  const review = await Review.create({
    user: userObjectId,
    dish: dishId,
    rating: data.rating,
    comment: data.comment || '',
  });

  return review;
};

/**
 * Update an existing review by ID
 * PUT /api/reviews/:id
 */
export const updateReview = async (reviewId: string, data: UpdateReviewInput, userId: string) => {
  // Find the review that is not soft-deleted and belongs to the user
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
    deletedAt: null,
  });

  if (!review) {
    throw new Error('Review not found or you are not the author');
  }

  // Update fields and save to trigger post-save hook (which updates Dish rating)
  if (data.rating !== undefined) {
    review.rating = data.rating;
  }
  if (data.comment !== undefined) {
    review.comment = data.comment;
  }

  await review.save();

  return review;
};

/**
 * Soft delete a review (set deletedAt)
 * DELETE /api/reviews/:id (User only)
 */
export const softDeleteReview = async (reviewId: string, userId: string) => {
  // Use findOneAndUpdate to perform atomic soft delete and trigger post-update hook for Dish rating
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, user: userId, deletedAt: null }, // Match active review by user and ID
    { deletedAt: new Date() },
    { new: true }
  );

  if (!review) {
    throw new Error('Review not found or you are not the author');
  }

  // FindOneAndUpdate returns the document before or after update. The post hook handles rating update.
  return review;
};

/**
 * Hard delete a review (Admin only)
 * DELETE /api/reviews/:id/hard
 */
export const hardDeleteReview = async (reviewId: string) => {
  // Using findByIdAndDelete to trigger post-remove hook for Dish rating update
  const review = await Review.findByIdAndDelete(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};
