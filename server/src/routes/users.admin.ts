import { Router } from 'express';
import * as userController from '../controllers/user';
import { authenticate, authorize, validate } from '@/middleware';
import z from 'zod';

const router = Router();

// ADMIN ROUTES
router.use(authenticate, authorize('admin'));

// CREATE
router.post(
  '/',
  validate(
    z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['guest', 'admin']).optional(),
      isLocked: z.boolean().optional(),
    })
  ),
  userController.createUserAdmin
);

// GET ALL
router.get('/', userController.getUsersAdmin);

// UPDATE ROLE
router.put(
  '/:id/role',
  validate(
    z.object({
      role: z.enum(['guest', 'admin'], {
        message: 'Role must be either "guest" or "admin"',
      }),
    })
  ),
  userController.updateUserRole
);

// TOGGLE LOCK
router.put('/:id/lock', userController.toggleUserLock);

// GET BY ID
router.get('/:id', userController.getUserByIdAdmin);

// UPDATE
router.put(
  '/:id',
  validate(
    z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      role: z.enum(['guest', 'admin']).optional(),
      isLocked: z.boolean().optional(),
    })
  ),
  userController.updateUserAdmin
);

// DELETE
router.delete('/:id', userController.deleteUserAdmin);

export default router;

