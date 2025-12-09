import { Request, Response } from 'express';
import { ErrorCode } from '../../../shared/types';
import * as dishService from '../services/dishService';

// feature for end user
export const getDishes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, category, region, search, sortBy } = req.query;

    const result = await dishService.getDishes({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      category: category as string,
      region: region as string,
      search: search as string,
      sortBy: sortBy as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch dishes',
      },
    });
  }
};

export const getDishById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await dishService.getDishById(id);

    res.status(200).json({
      success: true,
      data: { dish },
    });
  } catch (error: any) {
    console.error('Get dish by ID error:', error);

    if (error.message === 'Dish not found') {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Dish not found',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch dish',
      },
    });
  }
};

// feature for admin
export const getDishesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, category, region, search, sortBy } = req.query;

    const result = await dishService.getDishesAdmin({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      category: category as string,
      region: region as string,
      search: search as string,
      sortBy: sortBy as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get dishes admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch dishes (Admin)',
      },
    });
  }
};

export const getUnassignedDishesList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const dishes = await dishService.getUnassignedActiveDishes(search as string); // Truyền search query

    res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    console.error('Get unassigned dishes error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch unassigned dishes',
      },
    });
  }
};

export const getDishByIdAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await dishService.getDishByIdAdmin(id);

    res.status(200).json({
      success: true,
      data: { dish },
    });
  } catch (error: any) {
    console.error('Get dish admin by id error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch dish by id (Admin)',
      },
    });
  }
};

export const restoreDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await dishService.restoreDish(id);

    res.status(200).json({
      success: true,
      data: { message: 'Dish restored successfully' },
    });
  } catch (error: any) {
    console.error('Restore dish admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to restore dish (Admin)',
      },
    });
  }
};

export const createDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const dishData = {
      ...req.body,
      createdBy: req.user?.userId,
    };

    const dish = await dishService.createDish(dishData);

    res.status(201).json({
      success: true,
      data: { dish },
    });
  } catch (error) {
    console.error('Create dish error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create dish',
      },
    });
  }
};

export const updateDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dish = await dishService.updateDish(id, req.body, req.user!.userId);

    res.status(200).json({
      success: true,
      data: { dish },
    });
  } catch (error: any) {
    console.error('Update dish error:', error);

    if (error.message === 'Dish not found') {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Dish not found',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to update dish',
      },
    });
  }
};

export const deleteDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await dishService.deleteDish(id);

    res.status(200).json({
      success: true,
      data: { message: 'Dish soft-deleted successfully' },
    });
  } catch (error: any) {
    console.error('Delete dish error:', error);

    if (error.message === 'Dish not found') {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Dish not found or already soft-deleted',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to delete dish',
      },
    });
  }
};

export const getDishHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const history = await dishService.getDishHistory(id);

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error: any) {
    console.error('Get dish history error:', error);

    if (error.message === 'Dish not found') {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'Dish not found',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch dish history',
      },
    });
  }
};

export const revertDish = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { version } = req.body;

    const dish = await dishService.revertDishToVersion(id, version, req.user!.userId);

    res.status(200).json({
      success: true,
      data: { dish },
    });
  } catch (error: any) {
    console.error('Revert dish error:', error);

    if (error.message === 'Dish not found' || error.message === 'Version not found') {
      res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: error.message,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to revert dish',
      },
    });
  }
};

export const uploadDishImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'No images uploaded',
        },
      });
      return;
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map((file) => `/uploads/dishes/${file.filename}`);

    res.status(200).json({
      success: true,
      data: { images: imageUrls },
    });
  } catch (error) {
    console.error('Upload dish images error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to upload images',
      },
    });
  }
};
