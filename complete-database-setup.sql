-- =====================================================
-- COMPLETE DATABASE SETUP FOR CONSTRUCTBMS
-- =====================================================
-- Run this in your Supabase SQL Editor to fix all database issues

-- Step 1: Drop existing tables if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS permission_matrix CASCADE;
DROP TABLE IF EXISTS project_user_permissions CASCADE;
DROP TABLE IF EXISTS permission_audit_log CASCADE;

-- Step 2: Create user_roles table with correct schema
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'project_manager', 'admin', 'super_admin')),
    permissions TEXT[] DEFAULT '{}',
    project_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Step 3: Create permission_matrix table
CREATE TABLE permission_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    matrix JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create project_user_permissions table
CREATE TABLE project_user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT '{}',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

-- Step 5: Create permission_audit_log table
CREATE TABLE permission_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    target_project_id UUID,
    permission TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_project_user_permissions_project_id ON project_user_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_user_permissions_user_id ON project_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created_at ON permission_audit_log(created_at);

-- Step 7: Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

CREATE OR REPLACE FUNCTION update_permission_matrix_updated_at()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_permission_matrix_updated_at
    BEFORE UPDATE ON permission_matrix
    FOR EACH ROW
    EXECUTE FUNCTION update_permission_matrix_updated_at();

-- Step 8: Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
CREATE POLICY \
Users
can
view
their
own
role\ ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY \Admins
can
view
all
user
roles\ ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY \Admins
can
insert
user
roles\ ON user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY \Admins
can
update
user
roles\ ON user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY \Admins
can
delete
user
roles\ ON user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Step 10: Insert default admin user role (replace with your actual user ID)
INSERT INTO user_roles (user_id, role, permissions, project_permissions)
VALUES (
    '58309b6c-86f7-482b-af81-e3736be3e5f2', -- Replace with your actual user ID
    'super_admin',
    ARRAY['*'],
    '{}'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    project_permissions = EXCLUDED.project_permissions;

-- Step 11: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON permission_matrix TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_user_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON permission_audit_log TO authenticated;

-- Step 12: Verify the table structure
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('user_roles', 'permission_matrix', 'project_user_permissions', 'permission_audit_log')
ORDER BY table_name, ordinal_position;

-- Step 13: Test the setup
SELECT * FROM user_roles WHERE user_id = '58309b6c-86f7-482b-af81-e3736be3e5f2';
