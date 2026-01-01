import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant';
import { authenticate, authorize, validate } from '@/middleware';
import z from 'zod';
import { uploadMultiple } from '@/middleware/upload';

const router = Router();

// ADMIN ROUTES
router.use(authenticate, authorize('admin'));

// GET ALL
router.get('/', restaurantController.getRestaurantsAdmin);

// GET BY ID
router.get('/:id', restaurantController.getRestaurantByIdAdmin);

// CREATE
router.post('/', validate(z.object({})), restaurantController.createRestaurant);

// UPDATE
router.put('/:id', validate(z.object({})), restaurantController.updateRestaurant);

// DELETE (Hard Delete)
router.delete('/:id', restaurantController.deleteRestaurant);

// UPLOAD IMAGES
router.post('/upload', uploadMultiple, restaurantController.uploadRestaurantImages);

export default router;
