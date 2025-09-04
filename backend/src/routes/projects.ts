import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { supabase } from '../services/supabase';
import { authenticateToken, requireUser } from '../middleware/auth';

const log = console.log;
import { ProjectStatus } from '../types';

const router = Router();

// Get all projects with pagination
router.get(
  '/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(Object.values(ProjectStatus)),
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
      const status = req.query.status as string;
      const search = req.query.search as string;

      let query = supabase.from('projects').select(
        `
        *,
        clients (
          id,
          name,
          company
        )
      `,
        { count: 'exact' }
      );

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: projects, error, count } = await query;

      if (error) {
        log('Error fetching projects:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching projects',
        });
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.json({
        success: true,
        data: {
          projects,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
          },
        },
      });
    } catch (error) {
      log('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get project by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        clients (
          id,
          name,
          email,
          phone,
          company
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    log('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Create new project
router.post(
  '/',
  authenticateToken,
  requireUser,
  [
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('description').trim().isLength({ min: 1 }),
    body('clientId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').optional().isISO8601(),
    body('budget').isFloat({ min: 0 }),
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

      const { name, description, clientId, startDate, endDate, budget } =
        req.body;

      // Verify client exists
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        return res.status(400).json({
          success: false,
          message: 'Invalid client ID',
        });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          client_id: clientId,
          start_date: startDate,
          end_date: endDate,
          budget,
          status: ProjectStatus.PLANNING,
        })
        .select()
        .single();

      if (error) {
        log('Error creating project:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating project',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      log('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update project
router.put(
  '/:id',
  authenticateToken,
  requireUser,
  [
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().trim().isLength({ min: 1 }),
    body('status').optional().isIn(Object.values(ProjectStatus)),
    body('clientId').optional().isUUID(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('budget').optional().isFloat({ min: 0 }),
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

      // Transform field names to snake_case
      const transformedData: Record<string, unknown> = {};
      if (updateData.name) transformedData.name = updateData.name;
      if (updateData.description)
        transformedData.description = updateData.description;
      if (updateData.status) transformedData.status = updateData.status;
      if (updateData.clientId) transformedData.client_id = updateData.clientId;
      if (updateData.startDate)
        transformedData.start_date = updateData.startDate;
      if (updateData.endDate) transformedData.end_date = updateData.endDate;
      if (updateData.budget) transformedData.budget = updateData.budget;

      const { data: project, error } = await supabase
        .from('projects')
        .update(transformedData)
        .eq('id', id)
        .select()
        .single();

      if (error || !project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      log('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Delete project
router.delete(
  '/:id',
  authenticateToken,
  requireUser,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) {
        log('Error deleting project:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting project',
        });
      }

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      log('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export { router as projectRoutes };
