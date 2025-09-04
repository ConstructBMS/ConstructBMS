import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { supabase } from '../services/supabase';
import { authenticateToken, requireUser } from '../middleware/auth';

const log = console.log;

const router = Router();

// Get all clients with pagination
router.get(
  '/',
  authenticateToken,
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

      let query = supabase.from('clients').select('*', { count: 'exact' });

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      query = query.range(offset, offset + limit - 1);

      const { data: clients, error, count } = await query;

      if (error) {
        log('Error fetching clients:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching clients',
        });
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json({
        success: true,
        data: {
          clients,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
          },
        },
      });
    } catch (error) {
      log('Get clients error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get client by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    log('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Create new client
router.post(
  '/',
  authenticateToken,
  requireUser,
  [
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().isLength({ min: 1 }),
    body('address').trim().isLength({ min: 1 }),
    body('company').trim().isLength({ min: 1 }),
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

      const { name, email, phone, address, company } = req.body;

      // Check if client with email already exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single();

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Client with this email already exists',
        });
      }

      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          name,
          email,
          phone,
          address,
          company,
        })
        .select()
        .single();

      if (error) {
        log('Error creating client:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating client',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: client,
      });
    } catch (error) {
      log('Create client error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update client
router.put(
  '/:id',
  authenticateToken,
  requireUser,
  [
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim().isLength({ min: 1 }),
    body('address').optional().trim().isLength({ min: 1 }),
    body('company').optional().trim().isLength({ min: 1 }),
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

      const { id } = req.params;
      const updateData = req.body;

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const { data: client, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found',
        });
      }

      res.json({
        success: true,
        message: 'Client updated successfully',
        data: client,
      });
    } catch (error) {
      log('Update client error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Delete client
router.delete(
  '/:id',
  authenticateToken,
  requireUser,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) {
        log('Error deleting client:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting client',
        });
      }

      res.json({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      log('Delete client error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export { router as clientRoutes };
