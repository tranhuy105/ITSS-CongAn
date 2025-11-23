import express from 'express';
import * as restaurantController from '../controllers/restaurant';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All restaurant routes require authentication
router.use(authenticate);

// Get all restaurants with optional filters
router.get('/', restaurantController.getRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Get restaurants by dish ID
router.get('/dish/:dishId', restaurantController.getRestaurantsByDish);

export default router;
