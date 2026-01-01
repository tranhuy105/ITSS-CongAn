import { Router } from 'express';
import { authenticate, authorize } from '@/middleware';
import * as analyticsController from '../controllers/analytics';

const router = Router();

// ADMIN ROUTES
router.use(authenticate, authorize('admin'));

router.get('/overview', analyticsController.getAdminAnalyticsOverview);

export default router;


