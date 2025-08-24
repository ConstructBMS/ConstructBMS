import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { supabase } from '../services/supabase';
import { authenticateToken, requireUser } from '../middleware/auth';
import { TaskStatus, TaskPriority } from '../types';

const router = Router();

// Get all tasks with pagination
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(Object.values(TaskStatus)),
  query('priority').optional().isIn(Object.values(TaskPriority)),
  query('search').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const search = req.query.search as string;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name
        )
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching tasks'
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new task
router.post('/', authenticateToken, requireUser, [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').trim().isLength({ min: 1 }),
  body('priority').isIn(Object.values(TaskPriority)),
  body('assigneeId').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body('dueDate').optional().isISO8601()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, priority, assigneeId, projectId, dueDate } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        priority,
        assignee_id: assigneeId,
        project_id: projectId,
        due_date: dueDate,
        status: TaskStatus.TODO
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating task'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update task
router.put('/:id', authenticateToken, requireUser, [
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('priority').optional().isIn(Object.values(TaskPriority)),
  body('assigneeId').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body('dueDate').optional().isISO8601()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Transform field names to snake_case
    const transformedData: any = {};
    if (updateData.title) transformedData.title = updateData.title;
    if (updateData.description) transformedData.description = updateData.description;
    if (updateData.status) transformedData.status = updateData.status;
    if (updateData.priority) transformedData.priority = updateData.priority;
    if (updateData.assigneeId) transformedData.assignee_id = updateData.assigneeId;
    if (updateData.projectId) transformedData.project_id = updateData.projectId;
    if (updateData.dueDate) transformedData.due_date = updateData.dueDate;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(transformedData)
      .eq('id', id)
      .select()
      .single();

    if (error || !task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete task
router.delete('/:id', authenticateToken, requireUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting task'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export { router as taskRoutes };
