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

// Admin functions
/**
 * GET /api/admin/users
 * Get paginated list of users for admin
 */
export const getUsersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, role, isLocked, sortBy } = req.query;

    // Parse isLocked from query string to boolean
    let parsedIsLocked: boolean | undefined = undefined;
    if (isLocked !== undefined) {
      const isLockedStr = Array.isArray(isLocked) ? isLocked[0] : isLocked;
      parsedIsLocked = String(isLockedStr) === 'true';
    }

    const result = await userService.getUsersAdmin({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      role: role as string,
      isLocked: parsedIsLocked,
      sortBy: sortBy as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get users admin error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch users (Admin)' },
    });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({
        success: false,
        error: { code: ErrorCode.VALIDATION_ERROR, message: 'Role is required' },
      });
      return;
    }

    const user = await userService.updateUserRole(id, role);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    if (error.message === 'Invalid role') {
      res.status(400).json({
        success: false,
        error: { code: ErrorCode.VALIDATION_ERROR, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to update user role' },
    });
  }
};

/**
 * PUT /api/admin/users/:id/lock
 * Toggle user lock status
 */
export const toggleUserLock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.toggleUserLock(id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error('Toggle user lock error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to toggle user lock' },
    });
  }
};

/**
 * POST /api/admin/users
 * Create a new user (Admin)
 */
export const createUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, isLocked } = req.body;

    const user = await userService.createUserAdmin({
      name,
      email,
      password,
      role,
      isLocked,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isLocked: user.isLocked,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Create user admin error:', error);
    if (error.message === 'Email already registered') {
      res.status(409).json({
        success: false,
        error: { code: ErrorCode.CONFLICT, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to create user (Admin)' },
    });
  }
};

/**
 * GET /api/admin/users/:id
 * Get user by id (Admin)
 */
export const getUserByIdAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.getUserByIdAdmin(id);

    res.status(200).json({ success: true, data: { user } });
  } catch (error: any) {
    console.error('Get user admin by id error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch user by id (Admin)' },
    });
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user (Admin)
 */
export const updateUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, role, isLocked } = req.body;

    const user = await userService.updateUserAdmin(id, { name, email, password, role, isLocked });

    res.status(200).json({ success: true, data: { user } });
  } catch (error: any) {
    console.error('Update user admin error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    if (error.message === 'Email already registered') {
      res.status(409).json({
        success: false,
        error: { code: ErrorCode.CONFLICT, message: error.message },
      });
      return;
    }
    if (error.message === 'Invalid role') {
      res.status(400).json({
        success: false,
        error: { code: ErrorCode.VALIDATION_ERROR, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to update user (Admin)' },
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user (Admin)
 */
export const deleteUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      res.status(400).json({
        success: false,
        error: { code: ErrorCode.VALIDATION_ERROR, message: 'Cannot delete your own account' },
      });
      return;
    }

    await userService.deleteUserAdmin(id);

    res.status(200).json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (error: any) {
    console.error('Delete user admin error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: { code: ErrorCode.NOT_FOUND, message: error.message },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to delete user (Admin)' },
    });
  }
};
