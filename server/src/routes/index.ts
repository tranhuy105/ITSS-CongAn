import { Router } from 'express';
import authRoutes from './auth';
import dishRoutes from './dish';
import reviewRoutes from './review';
import userRoutes from './user';
import publicRestaurantsRouter from './restaurants.public';
import adminRestaurantsRouter from './restaurants.admin';
const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/dishes', dishRoutes);
router.use('/restaurants', publicRestaurantsRouter);
router.use('/admin/restaurants', adminRestaurantsRouter);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);

export default router;
