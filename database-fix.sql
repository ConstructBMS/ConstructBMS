-- =====================================================
-- DATABASE FIX SCRIPT FOR CONSTRUCTBMS
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the user_roles table

-- Drop existing user_roles table if it exists
DROP TABLE IF EXISTS user_roles CASCADE;

-- Recreate user_roles table with correct schema
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Create trigger for updated_at
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

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Insert default admin user role (replace with your actual user ID)
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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;
GRANT USAGE ON SEQUENCE user_roles_id_seq TO authenticated;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;
