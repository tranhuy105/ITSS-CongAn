import { Router } from 'express';
import authRoutes from './auth';
import dishRoutes from './dish';
import restaurantRoutes from './restaurant';
import reviewRoutes from './review';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/dishes', dishRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/reviews', reviewRoutes);

export default router;
