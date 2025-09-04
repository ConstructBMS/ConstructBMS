import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { supabase } from '../services/supabase';
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from '../middleware/auth';
import { UserRole } from '../types';

const log = console.log;

const router = Router();

// Get all users with pagination
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search as string;

      let query = supabase.from('users').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data: users, error, count } = await query;

      if (error) {
        log('Error fetching users:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching users',
        });
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
          },
        },
      });
    } catch (error) {
      log('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update user role
router.patch(
  '/:id/role',
  authenticateToken,
  requireAdmin,
  [body('role').isIn(Object.values(UserRole))],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { role } = req.body;

      const { data: user, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id)
        .select()
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      log('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Delete user
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;

      // Prevent deleting own account
      if (id === authReq.user?.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      const { error } = await supabase.from('users').delete().eq('id', id);

      if (error) {
        log('Error deleting user:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting user',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      log('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export { router as userRoutes };
