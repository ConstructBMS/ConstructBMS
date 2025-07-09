-- Check what data exists in the database

-- Check organizations
SELECT 'Organizations:' as table_name, count(*) as count FROM organizations
UNION ALL
-- Check roles
SELECT 'Roles:', count(*) FROM roles
UNION ALL
-- Check users
SELECT 'Users:', count(*) FROM users  
UNION ALL
-- Check user_roles
SELECT 'User Roles:', count(*) FROM user_roles
UNION ALL
-- Check menu_items
SELECT 'Menu Items:', count(*) FROM menu_items
UNION ALL
-- Check business_metrics
SELECT 'Business Metrics:', count(*) FROM business_metrics
UNION ALL
-- Check notifications
SELECT 'Notifications:', count(*) FROM notifications;

-- Show detailed organization info
SELECT 'Detailed Organization Info:' as info;
SELECT id, name, domain, created_at FROM organizations;

-- Show roles for the demo organization
SELECT 'Demo Organization Roles:' as info;
SELECT r.name, r.description, r.permissions 
FROM roles r 
WHERE r.organization_id = '550e8400-e29b-41d4-a716-446655440000';

-- Show users for the demo organization
SELECT 'Demo Organization Users:' as info;
SELECT u.email, u.first_name, u.last_name, u.is_active, r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.organization_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY u.email; 