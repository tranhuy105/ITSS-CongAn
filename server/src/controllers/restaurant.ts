import { Request, Response } from 'express';
import { ErrorCode } from '../../../shared/types';
import * as restaurantService from '../services/restaurantService';

// feature for end user
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, dishId, search, sortBy, latitude, longitude, maxDistance } = req.query;

    const result = await restaurantService.getRestaurants({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      dishId: dishId as string,
      search: search as string,
      sortBy: sortBy as string,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined,
      maxDistance: maxDistance ? parseInt(maxDistance as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch restaurants',
      },
    });
  }
};

export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantById(id);

    res.status(200).json({
      success: true,
      data: { restaurant },
    });
  } catch (error: any) {
    console.error('Get restaurant by ID error:', error);

    if (error.message === 'Restaurant not found') {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Restaurant not found',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch restaurant',
      },
    });
  }
};

export const getRestaurantsByDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dishId } = req.params;
    const restaurants = await restaurantService.getRestaurantsByDish(dishId);

    res.status(200).json({
      success: true,
      data: { restaurants },
    });
  } catch (error) {
    console.error('Get restaurants by dish error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch restaurants',
      },
    });
  }
};

// feature for admin
export const getRestaurantsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, dishId, search, sortBy } = req.query;

    const result = await restaurantService.getRestaurantsAdmin({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      dishId: dishId as string,
      search: search as string,
      sortBy: sortBy as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get restaurants admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch restaurants (Admin)',
      },
    });
  }
};

export const getRestaurantByIdAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantByIdAdmin(id);

    res.status(200).json({ success: true, data: { restaurant } });
  } catch (error: any) {
    console.error('Get restaurant admin by id error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch restaurant by id (Admin)',
      },
    });
  }
};

export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await restaurantService.createRestaurant(req.body);

    res.status(201).json({ success: true, data: { restaurant } });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to create restaurant' },
    });
  }
};

export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.updateRestaurant(id, req.body);

    res.status(200).json({ success: true, data: { restaurant } });
  } catch (error: any) {
    console.error('Update restaurant error:', error);
    if (error.message.includes('not found') || error.message.includes('soft-deleted')) {
      res
        .status(404)
        .json({ success: false, error: { code: ErrorCode.NOT_FOUND, message: error.message } });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to update restaurant' },
    });
  }
};

export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await restaurantService.deleteRestaurant(id);

    res
      .status(200)
      .json({ success: true, data: { message: 'Restaurant soft-deleted successfully' } });
  } catch (error: any) {
    console.error('Delete restaurant error:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Restaurant not found or already soft-deleted',
        },
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to delete restaurant' },
    });
  }
};

export const restoreRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await restaurantService.restoreRestaurant(id);

    res.status(200).json({ success: true, data: { message: 'Restaurant restored successfully' } });
  } catch (error: any) {
    console.error('Restore restaurant admin by id error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to restore restaurant by id (Admin)',
      },
    });
  }
};

export const uploadRestaurantImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: ErrorCode.VALIDATION_ERROR, message: 'No images uploaded' },
      });
      return;
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map((file) => `/uploads/restaurants/${file.filename}`);

    res.status(200).json({
      success: true,
      data: { images: imageUrls },
    });
  } catch (error) {
    console.error('Upload restaurant images error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to upload images' },
    });
  }
};
