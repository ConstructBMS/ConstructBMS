import { Request, Response, Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, requireUser } from '../middleware/auth';
import { supabase } from '../services/supabase';
import { ProjectStatus } from '../types';

const log = console.log;

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
    query('orgId').optional().isString(),
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
      const orgId = req.query.orgId as string;

      let query = supabase.from('projects').select(`
        *,
        clients (
          id,
          name,
          company
        )
      `);

      // Apply org filter if provided (skip if table doesn't exist yet)
      if (orgId) {
        query = query.eq('org_id', orgId);
      }

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

      const { data: projects, error } = await query;

      if (error) {
        log('Error fetching projects:', error);

        // If table doesn't exist, return mock data for demo mode
        if (
          error.code === '42703' &&
          error.message.includes('does not exist')
        ) {
          log(
            'Projects table does not exist, returning mock data for demo mode'
          );
          const mockProjects = [
            {
              id: 'proj-1',
              org_id: orgId || 'org-1',
              name: 'Demo Project Alpha',
              description: 'A sample construction project for demonstration',
              status: 'planned',
              start_date: '2024-01-15',
              end_date: '2024-06-30',
              budget: 150000,
              client_id: null,
              tags: ['residential', 'demo'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'proj-2',
              org_id: orgId || 'org-1',
              name: 'Demo Project Beta',
              description: 'Another sample project to showcase the system',
              status: 'in-progress',
              start_date: '2024-02-01',
              end_date: '2024-08-15',
              budget: 275000,
              client_id: null,
              tags: ['commercial', 'demo'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
          return res.json(mockProjects);
        }

        return res.status(500).json({
          success: false,
          message: 'Error fetching projects',
        });
      }

      // Return projects array directly for frontend compatibility
      res.json(projects || []);
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

    res.json(project);
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
          status: ProjectStatus.PLANNED,
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

      res.status(201).json(project);
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

      res.json(project);
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

      res.status(204).send();
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
