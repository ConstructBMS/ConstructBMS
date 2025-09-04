import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { supabase } from '../services/supabase';

const log = console.log;

const router = Router();

// Get all modules
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .order('name');

    if (error) {
      log('Error fetching modules:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching modules',
      });
    }

    res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    log('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Toggle module status
router.patch(
  '/:id/toggle',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get current module status
      const { data: module, error: fetchError } = await supabase
        .from('modules')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError || !module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found',
        });
      }

      // Toggle status
      const { data: updatedModule, error } = await supabase
        .from('modules')
        .update({ is_active: !module.is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        log('Error updating module:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating module',
        });
      }

      res.json({
        success: true,
        message: 'Module status updated successfully',
        data: updatedModule,
      });
    } catch (error) {
      log('Toggle module error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Create new module
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('description').trim().isLength({ min: 1 }),
    body('icon').trim().isLength({ min: 1 }),
    body('route').trim().isLength({ min: 1 }),
    body('permissions').isArray(),
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

      const { name, description, icon, route, permissions } = req.body;

      const { data: module, error } = await supabase
        .from('modules')
        .insert({
          name,
          description,
          icon,
          route,
          permissions,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        log('Error creating module:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating module',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Module created successfully',
        data: module,
      });
    } catch (error) {
      log('Create module error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export { router as moduleRoutes };
