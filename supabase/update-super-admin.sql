-- Update Super Admin User to Real Supabase Auth User
-- This will update the demo super admin to use the real Supabase Auth credentials

-- First, let's update the organization to reflect the real company
UPDATE organizations 
SET name = 'Archer Build Ltd', 
    domain = 'archerbuild.com',
    settings = '{"theme": "blue", "timezone": "UTC", "company": "Archer Build Ltd"}'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Update the super admin user record to match the real Supabase Auth user
-- Note: You'll need to get the actual UUID from Supabase Auth and replace it here
UPDATE users 
SET email = 'constructbms@gmail.com',
    first_name = 'Archer',
    last_name = 'Admin',
    updated_at = CURRENT_TIMESTAMP
WHERE id = '550e8400-e29b-41d4-a716-446655440010';

-- Update any notifications that reference the old email
UPDATE notifications 
SET title = 'Welcome to Archer Build Ltd!',
    message = 'Welcome to your Archer Business Management System. You are logged in as Super Admin.'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';

-- Optional: Clean up other demo users if you only want the real super admin
-- Uncomment the lines below if you want to remove the other demo users

-- DELETE FROM notifications WHERE user_id IN (
--     '550e8400-e29b-41d4-a716-446655440011',
--     '550e8400-e29b-41d4-a716-446655440012', 
--     '550e8400-e29b-41d4-a716-446655440013',
--     '550e8400-e29b-41d4-a716-446655440014'
-- );

-- DELETE FROM user_roles WHERE user_id IN (
--     '550e8400-e29b-41d4-a716-446655440011',
--     '550e8400-e29b-41d4-a716-446655440012',
--     '550e8400-e29b-41d4-a716-446655440013', 
--     '550e8400-e29b-41d4-a716-446655440014'
-- );

-- DELETE FROM users WHERE id IN (
--     '550e8400-e29b-41d4-a716-446655440011',
--     '550e8400-e29b-41d4-a716-446655440012',
--     '550e8400-e29b-41d4-a716-446655440013',
--     '550e8400-e29b-41d4-a716-446655440014'
-- );

-- Show the updated super admin user
SELECT 'Updated Super Admin User:' as info;
SELECT u.email, u.first_name, u.last_name, u.is_active, r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.id = '550e8400-e29b-41d4-a716-446655440010'; 