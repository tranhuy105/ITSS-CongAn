import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant';

const router = Router();

// Get all restaurants with optional filters
router.get('/', restaurantController.getRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Get restaurants by dish ID
router.get('/dish/:dishId', restaurantController.getRestaurantsByDish);

export default router;
