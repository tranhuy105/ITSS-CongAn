import { Router, Request, Response, NextFunction } from 'express';
import * as userController from '../controllers/user';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Zod schema for dishId in params
const dishIdParamSchema = z.object({
  dishId: z
    .string()
    .min(1, 'Dish ID is required in URL parameter')
    .length(24, 'Dish ID must be a 24 character hex string'),
});

const validateParams = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const error = result.error;
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }

    next();
  };
};

// All user-related actions require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/favorites
 * @desc    Get paginated list of favorited dishes
 * @access  Private
 */
router.get('/favorites', userController.getFavorites);

/**
 * @route   POST /api/users/favorites/:dishId
 * @desc    Add a dish to favorites
 * @access  Private
 */
// Note: validate middleware here would typically validate req.params, but Zod lacks robust param validation built-in.
// We use a simple check in the controller, or we can use a dedicated validation middleware for params if desired.
router.post(
  '/favorites/:dishId',
  validateParams(dishIdParamSchema.pick({ dishId: true }).required()),
  userController.addFavorite
);

/**
 * @route   DELETE /api/users/favorites/:dishId
 * @desc    Remove a dish from favorites
 * @access  Private
 */
router.delete(
  '/favorites/:dishId',
  validateParams(dishIdParamSchema.pick({ dishId: true }).required()),
  userController.removeFavorite
);

/**
 * @route   GET /api/users/favorites/:dishId
 * @desc    Check if a dish is currently favorited
 * @access  Private (though logic handles public users by returning false)
 */
router.get(
  '/favorites/:dishId',
  validateParams(dishIdParamSchema.pick({ dishId: true }).required()),
  userController.checkIsFavorite
);

export default router;
