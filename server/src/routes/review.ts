import { Router } from 'express';
import {
  createReview,
  deleteReview,
  getReviews,
  hardDeleteReview,
  updateReview,
} from '../controllers/review';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema, updateReviewSchema } from '../validators/review';

const router = Router();

/**
 * @route   GET /api/reviews/dish/:dishId
 * @desc    Get paginated list of reviews for a dish
 * @access  Public (Không cần authenticate)
 */
router.get('/dish/:dishId', getReviews);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private (Cần authenticate)
 * @body    { dishId: string, rating: number, comment?: string }
 */
router.post('/', authenticate, validate(createReviewSchema), createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review (Chỉ tác giả mới có thể sửa)
 * @access  Private (Cần authenticate)
 * @body    { rating?: number, comment?: string }
 */
router.put('/:id', authenticate, validate(updateReviewSchema), updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Soft delete a review (Chỉ tác giả mới có thể xóa mềm)
 * @access  Private (Cần authenticate)
 */
router.delete('/:id', authenticate, deleteReview);

/**
 * @route   DELETE /api/reviews/:id/hard
 * @desc    Hard delete a review
 * @access  Private (Chỉ Admin)
 */
router.delete('/:id/hard', authenticate, authorize('admin'), hardDeleteReview);

export default router;
