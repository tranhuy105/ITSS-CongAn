import { Router } from 'express';
import {
  createDish,
  deleteDish,
  getActiveDishesList,
  getAssignedDishesList,
  getDishById,
  getDishByIdAdmin,
  getDishes,
  getDishesAdmin,
  getDishHistory,
  restoreDish,
  revertDish,
  updateDish,
  uploadDishImages,
} from '../controllers/dish';
import { authenticate, authorize } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { validateObjectIdParam } from '../middleware/objectId';
import { createDishSchema, updateDishSchema } from '../validators/dish';

const router = Router();

/**
 * @route   POST /api/dishes/upload
 * @desc    Upload dish images
 * @access  Private (Admin only)
 */
router.post('/upload', authenticate, authorize('admin'), uploadMultiple, uploadDishImages);

/**
 * @route   GET /api/dishes/admin
 * @desc    Admin: Get all dishes including deleted ones
 * @access  Private (Admin only)
 */
router.get('/admin', authenticate, authorize('admin'), getDishesAdmin);

/**
 * @route   GET /api/dishes/active-list
 * @desc    Admin: Get all active dishes (Non-paginated list for assignments)
 * @access  Private (Admin only)
 */
router.get('/active-list', authenticate, authorize('admin'), getActiveDishesList);
// Backward-compatible alias: client used to call /unassigned-list for the same data.
router.get('/unassigned-list', authenticate, authorize('admin'), getActiveDishesList);
/**
 * @route   GET /api/dishes/assigned-list/:id
 * @desc    Admin: Get all active dishes assigned to a specific restaurant ID (Non-paginated)
 * @access  Private (Admin only)
 */
router.get(
  '/assigned-list/:id',
  authenticate,
  authorize('admin'),
  validateObjectIdParam('id'),
  getAssignedDishesList
);

/**
 * @route   GET /api/dishes
 * @desc    Get all dishes with pagination and filters
 * @access  Public
 */
router.get('/', getDishes);

/**
 * @route   GET /api/dishes/:id/admin
 * @desc    Admin: Get dish by ID, including if deleted
 * @access  Private (Admin only)
 */
router.get(
  '/:id/admin',
  authenticate,
  authorize('admin'),
  validateObjectIdParam('id'),
  getDishByIdAdmin
);

/**
 * @route   GET /api/dishes/:id
 * @desc    Get dish by ID
 * @access  Public
 */
router.get('/:id', validateObjectIdParam('id'), getDishById);

/**
 * @route   POST /api/dishes
 * @desc    Create a new dish
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize('admin'), validate(createDishSchema), createDish);

/**
 * @route   PUT /api/dishes/:id
 * @desc    Update a dish
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateObjectIdParam('id'),
  validate(updateDishSchema),
  updateDish
);

/**
 * @route   DELETE /api/dishes/:id
 * @desc    Delete a dish
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), validateObjectIdParam('id'), deleteDish);

/**
 * @route   GET /api/dishes/:id/history
 * @desc    Get dish edit history
 * @access  Private (Admin only)
 */
router.get(
  '/:id/history',
  authenticate,
  authorize('admin'),
  validateObjectIdParam('id'),
  getDishHistory
);

/**
 * @route   POST /api/dishes/:id/revert
 * @desc    Revert dish to a previous version
 * @access  Private (Admin only)
 */
router.post('/:id/revert', authenticate, authorize('admin'), validateObjectIdParam('id'), revertDish);

/**
 * @route   POST /api/dishes/:id/restore
 * @desc    Restore a soft-deleted dish
 * @access  Private (Admin only)
 */
router.post(
  '/:id/restore',
  authenticate,
  authorize('admin'),
  validateObjectIdParam('id'),
  restoreDish
);

export default router;
