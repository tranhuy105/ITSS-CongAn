import { Request, Response } from 'express';
import { ErrorCode } from '../../../shared/types';
import * as restaurantService from '../services/restaurantService';

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
