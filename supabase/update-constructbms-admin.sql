-- Update Super Admin to ConstructBMS
-- This script ensures constructbms@gmail.com has full super admin access

-- Update the super admin user record
UPDATE users 
SET email = 'constructbms@gmail.com',
    first_name = 'ConstructBMS',
    last_name = 'Admin',
    updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440010';

-- Ensure super admin role assignment
INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
)
ON CONFLICT (user_id, role_id) 
DO UPDATE SET 
    updated_at = NOW();

-- Grant all permissions to super admin
UPDATE user_roles 
SET permissions = '["*"]',
    updated_at = NOW()
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';

-- Insert super admin into organization if not exists
INSERT INTO organization_users (organization_id, user_id, role, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440010',
    'super_admin',
    NOW(),
    NOW()
)
ON CONFLICT (organization_id, user_id) 
DO UPDATE SET 
    role = 'super_admin',
    updated_at = NOW();

-- Show the updated super admin user
SELECT 'Updated Super Admin User:' as info;
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    ur.role_id,
    ur.permissions,
    ou.role as org_role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN organization_users ou ON u.id = ou.user_id
WHERE u.email = 'constructbms@gmail.com'; 