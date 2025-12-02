import { ErrorCode } from '@shared/types';
import { Request, Response } from 'express';
import * as userService from '../services/userService';

/**
 * GET /api/users/favorites
 * Get paginated list of favorited dishes
 */
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: ErrorCode.UNAUTHORIZED, message: 'Not authenticated' },
      });
      return;
    }

    const { page, limit } = req.query;

    const result = await userService.getFavorites(req.user.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch favorites' },
    });
  }
};

/**
 * POST /api/users/favorites/:dishId
 * Add a dish to favorites
 */
export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: ErrorCode.UNAUTHORIZED, message: 'Not authenticated' },
      });
      return;
    }

    const { dishId } = req.params;
    await userService.addFavorite(req.user.userId, dishId);

    res.status(200).json({
      success: true,
      data: { message: 'Dish added to favorites' },
    });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    if (error.message.includes('Dish not found or inactive')) {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    if (error.message.includes('User not found')) {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to add favorite' },
    });
  }
};

/**
 * DELETE /api/users/favorites/:dishId
 * Remove a dish from favorites
 */
export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: ErrorCode.UNAUTHORIZED, message: 'Not authenticated' },
      });
      return;
    }

    const { dishId } = req.params;
    await userService.removeFavorite(req.user.userId, dishId);

    res.status(200).json({
      success: true,
      data: { message: 'Dish removed from favorites' },
    });
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to remove favorite' },
    });
  }
};

/**
 * GET /api/users/favorites/:dishId
 * Check if a dish is favorited by the current user
 */
export const checkIsFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({
        success: true,
        data: { isFavorite: false }, // If not authenticated, it's not favorited
      });
      return;
    }

    const { dishId } = req.params;
    const isFavorite = await userService.checkIsFavorite(req.user.userId, dishId);

    res.status(200).json({
      success: true,
      data: { isFavorite },
    });
  } catch (error: any) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to check favorite status' },
    });
  }
};
