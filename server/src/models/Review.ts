import mongoose, { Document, Model, Schema } from 'mongoose';
import Dish from './Dish';

// Review interface
export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  dish: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review schema
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    dish: {
      type: Schema.Types.ObjectId,
      ref: 'Dish',
      required: [true, 'Dish is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: function (rating: number) {
          // Ensure rating is an integer
          return Number.isInteger(rating);
        },
        message: 'Rating must be a whole number between 1 and 5',
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ dish: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
// Compound unique index to prevent duplicate reviews from same user for same dish
reviewSchema.index({ dish: 1, user: 1 }, { unique: true });

// Helper function to calculate and update dish rating
async function updateDishRating(dishId: mongoose.Types.ObjectId) {
  try {
    const Review = mongoose.model<IReview>('Review');

    // Calculate average rating and count
    const result = await Review.aggregate([
      { $match: { dish: dishId } },
      {
        $group: {
          _id: '$dish',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      // Update dish with new rating
      await Dish.findByIdAndUpdate(dishId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: result[0].reviewCount,
      });
    } else {
      // No reviews left, reset to 0
      await Dish.findByIdAndUpdate(dishId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  } catch (error) {
    console.error('Error updating dish rating:', error);
  }
}

// Post-save hook to update dish rating when review is created or updated
reviewSchema.post('save', async function (doc) {
  await updateDishRating(doc.dish);
});

// Post-remove hook to update dish rating when review is deleted
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await updateDishRating(doc.dish);
  }
});

// Post-update hook to update dish rating when review rating is modified
reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateDishRating(doc.dish);
  }
});

// Pre-save validation to check for duplicate reviews
reviewSchema.pre('save', async function () {
  if (this.isNew) {
    const Review = mongoose.model<IReview>('Review');
    const existingReview = await Review.findOne({
      user: this.user,
      dish: this.dish,
    });

    if (existingReview) {
      throw new Error('You have already reviewed this dish');
    }
  }
});

// Static method to get reviews for a dish with pagination
reviewSchema.statics.getReviewsByDish = function (
  dishId: mongoose.Types.ObjectId,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;

  return this.find({ dish: dishId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get review count for a dish
reviewSchema.statics.getReviewCount = function (dishId: mongoose.Types.ObjectId) {
  return this.countDocuments({ dish: dishId });
};

// Static method to check if user has reviewed a dish
reviewSchema.statics.hasUserReviewed = function (
  userId: mongoose.Types.ObjectId,
  dishId: mongoose.Types.ObjectId
) {
  return this.exists({ user: userId, dish: dishId });
};

// Create and export Review model
interface IReviewModel extends Model<IReview> {
  getReviewsByDish(
    dishId: mongoose.Types.ObjectId,
    page?: number,
    limit?: number
  ): Promise<IReview[]>;
  getReviewCount(dishId: mongoose.Types.ObjectId): Promise<number>;
  hasUserReviewed(
    userId: mongoose.Types.ObjectId,
    dishId: mongoose.Types.ObjectId
  ): Promise<boolean>;
}

const Review: IReviewModel = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
