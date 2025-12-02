import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant';
import { authenticate, authorize, validate } from '@/middleware';
import z from 'zod';
import { uploadMultiple } from '@/middleware/upload';

const router = Router();

// Get all restaurants with optional filters
router.get('/', restaurantController.getRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Get restaurants by dish ID
router.get('/dish/:dishId', restaurantController.getRestaurantsByDish);

// ADMIN ROUTES
router.use(authenticate, authorize('admin'));

// GET ALL
router.get('/admin', restaurantController.getRestaurantsAdmin);

// GET BY ID
router.get('/:id/admin', restaurantController.getRestaurantByIdAdmin);

// CREATE
router.post('/', validate(z.object({})), restaurantController.createRestaurant);

// UPDATE
router.put('/:id', validate(z.object({})), restaurantController.updateRestaurant);

// DELETE (Soft Delete)
router.delete('/:id', restaurantController.deleteRestaurant);

// RESTORE
router.post('/:id/restore', restaurantController.restoreRestaurant);

// UPLOAD IMAGES
router.post('/upload', uploadMultiple, restaurantController.uploadRestaurantImages);

export default router;
