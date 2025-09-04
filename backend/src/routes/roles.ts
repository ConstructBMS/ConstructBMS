import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
} from '../middleware/auth';
import { supabase } from '../services/supabase';
import { Permission, PermissionMatrix } from '../types';

const log = console.log;

const router = Router();

// Get all roles
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const { data: roles, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        log('Error fetching roles:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching roles',
        });
      }

      res.json({
        success: true,
        data: roles,
      });
    } catch (error) {
      log('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get role by ID
router.get(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: role, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      res.json({
        success: true,
        data: role,
      });
    } catch (error) {
      log('Get role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Create new role
router.post(
  '/',
  authenticateToken,
  requireSuperAdmin,
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
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

      const { name, description, permissions } = req.body;

      // Check if role name already exists
      const { data: existingRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', name)
        .single();

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists',
        });
      }

      const { data: role, error } = await supabase
        .from('roles')
        .insert({
          name,
          description,
          permissions,
          isSystem: false,
        })
        .select()
        .single();

      if (error) {
        log('Error creating role:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating role',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role,
      });
    } catch (error) {
      log('Create role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update role
router.put(
  '/:id',
  authenticateToken,
  requireSuperAdmin,
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
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

      const { id } = req.params;
      const { name, description, permissions } = req.body;

      // Check if role exists and is not system role
      const { data: existingRole } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      if (existingRole.isSystem) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify system roles',
        });
      }

      // Check if new name conflicts with existing role
      const { data: nameConflict } = await supabase
        .from('roles')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single();

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists',
        });
      }

      const { data: role, error } = await supabase
        .from('roles')
        .update({
          name,
          description,
          permissions,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        log('Error updating role:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating role',
        });
      }

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: role,
      });
    } catch (error) {
      log('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Delete role
router.delete(
  '/:id',
  authenticateToken,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if role exists and is not system role
      const { data: existingRole } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      if (existingRole.isSystem) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete system roles',
        });
      }

      // Check if role is assigned to any users
      const { data: usersWithRole } = await supabase
        .from('users')
        .select('id')
        .eq('role', existingRole.name);

      if (usersWithRole && usersWithRole.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role that is assigned to users',
        });
      }

      const { error } = await supabase.from('roles').delete().eq('id', id);

      if (error) {
        log('Error deleting role:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting role',
        });
      }

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      log('Delete role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get permissions matrix
router.get(
  '/permissions/matrix',
  authenticateToken,
  requireSuperAdmin,
  async (_req: Request, res: Response) => {
    try {
      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) {
        log('Error fetching roles:', rolesError);
        return res.status(500).json({
          success: false,
          message: 'Error fetching roles',
        });
      }

      // Get all permissions
      const permissions = Object.values(Permission);

      // Build matrix
      const matrix: Record<string, Record<string, boolean>> = {};

      roles?.forEach(role => {
        matrix[role.id] = {};
        permissions.forEach(permission => {
          matrix[role.id][permission] = role.permissions.includes(permission);
        });
      });

      const permissionMatrix: PermissionMatrix = {
        roles: roles || [],
        permissions,
        matrix,
      };

      res.json({
        success: true,
        data: permissionMatrix,
      });
    } catch (error) {
      log('Get permissions matrix error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update permissions matrix
router.put(
  '/permissions/matrix',
  authenticateToken,
  requireSuperAdmin,
  [body('matrix').isObject()],
  async (_req: Request, res: Response) => {
    try {
      const errors = validationResult(_req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { matrix } = _req.body;

      // Update each role's permissions
      for (const [roleId, permissions] of Object.entries(matrix)) {
        const permissionArray = Object.entries(
          permissions as Record<string, boolean>
        )
          .filter(([, hasPermission]) => hasPermission)
          .map(([permission]) => permission);

        const { error } = await supabase
          .from('roles')
          .update({
            permissions: permissionArray,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', roleId);

        if (error) {
          log(`Error updating role ${roleId}:`, error);
          return res.status(500).json({
            success: false,
            message: `Error updating role ${roleId}`,
          });
        }
      }

      res.json({
        success: true,
        message: 'Permissions matrix updated successfully',
      });
    } catch (error) {
      log('Update permissions matrix error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get all permissions
router.get(
  '/permissions/list',
  authenticateToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const permissions = Object.values(Permission);

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      log('Get permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export { router as roleRoutes };
