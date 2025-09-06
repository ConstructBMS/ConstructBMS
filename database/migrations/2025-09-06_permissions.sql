-- ============================================================================
-- Permissions v0 Migration - RBAC + ABAC Tables
-- ============================================================================
--
-- This migration creates the core tables for the ConstructBMS permissions system,
-- supporting both Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).
--
-- Created: 2025-01-06
-- Version: 0.1.0
-- ============================================================================

-- ============================================================================
-- Roles Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Role Bindings Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_bindings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role_id VARCHAR(255) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope VARCHAR(50) NOT NULL DEFAULT 'global',
    scope_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,

    -- Ensure unique user-role-scope combinations
    UNIQUE(user_id, role_id, scope, scope_id)
);

-- ============================================================================
-- Permission Rules Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_rules (
    id VARCHAR(255) PRIMARY KEY,
    role_id VARCHAR(255) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('allow', 'deny', 'inherit')),
    scope VARCHAR(50) NOT NULL DEFAULT 'global',
    scope_id VARCHAR(255),
    abac_rules JSONB,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,

    -- Ensure unique role-resource-action-scope combinations
    UNIQUE(role_id, resource, action, scope, scope_id)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Role bindings indexes
CREATE INDEX IF NOT EXISTS idx_role_bindings_user_id ON role_bindings(user_id);
CREATE INDEX IF NOT EXISTS idx_role_bindings_role_id ON role_bindings(role_id);
CREATE INDEX IF NOT EXISTS idx_role_bindings_scope ON role_bindings(scope, scope_id);

-- Permission rules indexes
CREATE INDEX IF NOT EXISTS idx_permission_rules_role_id ON permission_rules(role_id);
CREATE INDEX IF NOT EXISTS idx_permission_rules_resource ON permission_rules(resource);
CREATE INDEX IF NOT EXISTS idx_permission_rules_action ON permission_rules(action);
CREATE INDEX IF NOT EXISTS idx_permission_rules_scope ON permission_rules(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_permission_rules_decision ON permission_rules(decision);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_permission_rules_resource_action ON permission_rules(resource, action);
CREATE INDEX IF NOT EXISTS idx_permission_rules_role_resource ON permission_rules(role_id, resource);
CREATE INDEX IF NOT EXISTS idx_permission_rules_role_action ON permission_rules(role_id, action);

-- ============================================================================
-- Default System Roles
-- ============================================================================

INSERT INTO roles (id, name, description, is_system, created_at, updated_at) VALUES
('super-admin', 'SuperAdmin', 'Full system access with all permissions. Can manage all aspects of the system including user roles and permissions.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin', 'Admin', 'Administrative access to most system features. Can manage users, projects, and organizational settings.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('manager', 'Manager', 'Project and team management capabilities. Can oversee projects, manage team members, and access reporting features.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('staff', 'Staff', 'Standard employee access. Can work on assigned projects, create documents, and collaborate with team members.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('contractor', 'Contractor', 'Limited access for external contractors. Can view assigned projects and submit deliverables.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('client', 'Client', 'Read-only access for clients. Can view project progress, documents, and communicate with the team.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Default Permission Rules for SuperAdmin
-- ============================================================================

INSERT INTO permission_rules (id, role_id, resource, action, decision, scope, created_at, updated_at, created_by) VALUES
-- Dashboard permissions
('super-admin-dashboard-read', 'super-admin', 'dashboard', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-dashboard-create', 'super-admin', 'dashboard', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-dashboard-update', 'super-admin', 'dashboard', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-dashboard-delete', 'super-admin', 'dashboard', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-dashboard-manage', 'super-admin', 'dashboard', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Projects permissions
('super-admin-projects-read', 'super-admin', 'projects', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-projects-create', 'super-admin', 'projects', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-projects-update', 'super-admin', 'projects', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-projects-delete', 'super-admin', 'projects', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-projects-manage', 'super-admin', 'projects', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Programme permissions
('super-admin-programme-read', 'super-admin', 'programme', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-programme-create', 'super-admin', 'programme', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-programme-update', 'super-admin', 'programme', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-programme-delete', 'super-admin', 'programme', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-programme-manage', 'super-admin', 'programme', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Users permissions
('super-admin-users-read', 'super-admin', 'users', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-users-create', 'super-admin', 'users', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-users-update', 'super-admin', 'users', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-users-delete', 'super-admin', 'users', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-users-manage', 'super-admin', 'users', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Roles permissions
('super-admin-roles-read', 'super-admin', 'roles', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-roles-create', 'super-admin', 'roles', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-roles-update', 'super-admin', 'roles', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-roles-delete', 'super-admin', 'roles', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-roles-manage', 'super-admin', 'roles', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Permissions permissions
('super-admin-permissions-read', 'super-admin', 'permissions', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-permissions-create', 'super-admin', 'permissions', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-permissions-update', 'super-admin', 'permissions', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-permissions-delete', 'super-admin', 'permissions', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('super-admin-permissions-manage', 'super-admin', 'permissions', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Default Permission Rules for Admin
-- ============================================================================

INSERT INTO permission_rules (id, role_id, resource, action, decision, scope, created_at, updated_at, created_by) VALUES
-- Dashboard permissions
('admin-dashboard-read', 'admin', 'dashboard', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-dashboard-create', 'admin', 'dashboard', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-dashboard-update', 'admin', 'dashboard', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-dashboard-delete', 'admin', 'dashboard', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-dashboard-manage', 'admin', 'dashboard', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Projects permissions
('admin-projects-read', 'admin', 'projects', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-projects-create', 'admin', 'projects', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-projects-update', 'admin', 'projects', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-projects-delete', 'admin', 'projects', 'delete', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-projects-manage', 'admin', 'projects', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Users permissions
('admin-users-read', 'admin', 'users', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-users-create', 'admin', 'users', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-users-update', 'admin', 'users', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-users-delete', 'admin', 'users', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-users-manage', 'admin', 'users', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Roles permissions (limited)
('admin-roles-read', 'admin', 'roles', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-roles-create', 'admin', 'roles', 'create', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-roles-update', 'admin', 'roles', 'update', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-roles-delete', 'admin', 'roles', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-roles-manage', 'admin', 'roles', 'manage', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Permissions permissions (limited)
('admin-permissions-read', 'admin', 'permissions', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-permissions-create', 'admin', 'permissions', 'create', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-permissions-update', 'admin', 'permissions', 'update', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-permissions-delete', 'admin', 'permissions', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('admin-permissions-manage', 'admin', 'permissions', 'manage', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Default Permission Rules for Manager
-- ============================================================================

INSERT INTO permission_rules (id, role_id, resource, action, decision, scope, created_at, updated_at, created_by) VALUES
-- Dashboard permissions
('manager-dashboard-read', 'manager', 'dashboard', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-dashboard-create', 'manager', 'dashboard', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-dashboard-update', 'manager', 'dashboard', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-dashboard-delete', 'manager', 'dashboard', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-dashboard-manage', 'manager', 'dashboard', 'manage', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Projects permissions
('manager-projects-read', 'manager', 'projects', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-projects-create', 'manager', 'projects', 'create', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-projects-update', 'manager', 'projects', 'update', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-projects-delete', 'manager', 'projects', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-projects-manage', 'manager', 'projects', 'manage', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Users permissions (limited)
('manager-users-read', 'manager', 'users', 'read', 'allow', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-users-create', 'manager', 'users', 'create', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-users-update', 'manager', 'users', 'update', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-users-delete', 'manager', 'users', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-users-manage', 'manager', 'users', 'manage', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Roles permissions (denied)
('manager-roles-read', 'manager', 'roles', 'read', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-roles-create', 'manager', 'roles', 'create', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-roles-update', 'manager', 'roles', 'update', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-roles-delete', 'manager', 'roles', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-roles-manage', 'manager', 'roles', 'manage', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),

-- Permissions permissions (denied)
('manager-permissions-read', 'manager', 'permissions', 'read', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-permissions-create', 'manager', 'permissions', 'create', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-permissions-update', 'manager', 'permissions', 'update', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-permissions-delete', 'manager', 'permissions', 'delete', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
('manager-permissions-manage', 'manager', 'permissions', 'manage', 'deny', 'global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- View for user permissions with role information
CREATE OR REPLACE VIEW user_permissions AS
SELECT
    rb.user_id,
    r.name as role_name,
    pr.resource,
    pr.action,
    pr.decision,
    pr.scope,
    pr.scope_id,
    pr.abac_rules,
    pr.conditions
FROM role_bindings rb
JOIN roles r ON rb.role_id = r.id
JOIN permission_rules pr ON r.id = pr.role_id
WHERE rb.scope = pr.scope
  AND (rb.scope_id = pr.scope_id OR (rb.scope_id IS NULL AND pr.scope_id IS NULL));

-- View for role summary
CREATE OR REPLACE VIEW role_summary AS
SELECT
    r.id,
    r.name,
    r.description,
    r.is_system,
    COUNT(DISTINCT rb.user_id) as user_count,
    COUNT(DISTINCT pr.id) as rule_count,
    r.created_at,
    r.updated_at
FROM roles r
LEFT JOIN role_bindings rb ON r.id = rb.role_id
LEFT JOIN permission_rules pr ON r.id = pr.role_id
GROUP BY r.id, r.name, r.description, r.is_system, r.created_at, r.updated_at;

-- ============================================================================
-- Functions for Permission Evaluation
-- ============================================================================

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(
    p_user_id VARCHAR(255),
    p_resource VARCHAR(100),
    p_action VARCHAR(50),
    p_scope VARCHAR(50) DEFAULT 'global',
    p_scope_id VARCHAR(255) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    permission_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO permission_count
    FROM user_permissions
    WHERE user_id = p_user_id
      AND resource = p_resource
      AND action = p_action
      AND scope = p_scope
      AND (scope_id = p_scope_id OR (scope_id IS NULL AND p_scope_id IS NULL))
      AND decision = 'allow';

    RETURN permission_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(
    p_user_id VARCHAR(255),
    p_scope VARCHAR(50) DEFAULT 'global',
    p_scope_id VARCHAR(255) DEFAULT NULL
) RETURNS TABLE(
    resource VARCHAR(100),
    action VARCHAR(50),
    decision VARCHAR(20),
    role_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.resource,
        up.action,
        up.decision,
        up.role_name
    FROM user_permissions up
    WHERE up.user_id = p_user_id
      AND up.scope = p_scope
      AND (up.scope_id = p_scope_id OR (up.scope_id IS NULL AND p_scope_id IS NULL));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE roles IS 'System roles for RBAC';
COMMENT ON TABLE role_bindings IS 'User-role assignments with scope support';
COMMENT ON TABLE permission_rules IS 'Permission rules for resources and actions';

COMMENT ON COLUMN roles.is_system IS 'Indicates if this is a system-defined role that cannot be deleted';
COMMENT ON COLUMN role_bindings.scope IS 'Scope of the role binding: global, organization, project, user';
COMMENT ON COLUMN role_bindings.scope_id IS 'Optional scope identifier (e.g., project ID)';
COMMENT ON COLUMN permission_rules.decision IS 'Permission decision: allow, deny, or inherit';
COMMENT ON COLUMN permission_rules.abac_rules IS 'JSON array of ABAC rules for attribute-based access control';
COMMENT ON COLUMN permission_rules.conditions IS 'JSON array of conditions for the permission rule';

-- ============================================================================
-- Migration Complete
-- ============================================================================
