import { ErrorCode } from '@shared/types';
import { Request, Response } from 'express';
import * as reviewService from '../services/reviewService';

/**
 * GET /api/reviews/dish/:dishId
 * Get paginated list of reviews for a dish (Public)
 */
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const { dishId } = req.params;

    const result = await reviewService.getReviewsByDish({
      dishId,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch reviews',
      },
    });
  }
};

/**
 * POST /api/reviews
 * Create a new review (Private)
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      // Should be caught by authenticate middleware
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Not authenticated',
        },
      });
      return;
    }

    const reviewData = req.body;

    const review = await reviewService.createReview(reviewData, req.user.userId);

    res.status(201).json({
      success: true,
      data: { review },
    });
  } catch (error: any) {
    console.error('Create review error:', error);

    if (
      error.message.includes('You have already reviewed this dish') ||
      error.message.includes('duplicate key error')
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: ErrorCode.CONFLICT,
          message: 'You have already reviewed this dish for this dish.',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create review',
      },
    });
  }
};

/**
 * PUT /api/reviews/:id
 * Update an existing review (Private - Author only)
 */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Not authenticated',
        },
      });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    const review = await reviewService.updateReview(id, updateData, req.user.userId);

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error: any) {
    console.error('Update review error:', error);

    if (error.message.includes('Review not found or you are not the author')) {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Review not found or you are not authorized to update it',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to update review',
      },
    });
  }
};

/**
 * DELETE /api/reviews/:id
 * Soft delete a review (Private - Author only)
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Not authenticated',
        },
      });
      return;
    }

    const { id } = req.params;
    await reviewService.softDeleteReview(id, req.user.userId);

    res.status(200).json({
      success: true,
      data: { message: 'Review soft deleted successfully' },
    });
  } catch (error: any) {
    console.error('Soft delete review error:', error);

    if (error.message.includes('Review not found or you are not the author')) {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Review not found or you are not authorized to delete it',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to delete review',
      },
    });
  }
};

/**
 * DELETE /api/reviews/:id/hard
 * Hard delete a review (Private - Admin only)
 */
export const hardDeleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await reviewService.hardDeleteReview(id);

    res.status(200).json({
      success: true,
      data: { message: 'Review hard deleted successfully' },
    });
  } catch (error: any) {
    console.error('Hard delete review error:', error);

    if (error.message.includes('Review not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Review not found',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to hard delete review',
      },
    });
  }
};
