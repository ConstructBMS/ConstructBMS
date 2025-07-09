-- Reset Demo Data Script
-- This will safely remove existing demo data and re-insert it

-- Remove existing demo data (in reverse order of dependencies)
DELETE FROM notifications WHERE user_id IN (
  SELECT id FROM users WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'
);

DELETE FROM business_metrics WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

DELETE FROM menu_items WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM users WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'
);

DELETE FROM users WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

DELETE FROM roles WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

DELETE FROM organizations WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Now re-insert the demo data
-- Insert Demo Organization
INSERT INTO organizations (id, name, domain, settings) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Archer Demo Company', 'archer-demo.com', '{"theme": "blue", "timezone": "UTC"}');

-- Insert Demo Roles
INSERT INTO roles (id, organization_id, name, description, permissions) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Super Admin', 'Full system access', '["*"]'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Admin', 'Administrative access', '["users.manage", "roles.manage", "projects.manage", "analytics.view"]'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Employee', 'Standard user access', '["projects.view", "tasks.manage", "profile.edit"]'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Contractor', 'Limited contractor access', '["projects.view", "tasks.view", "profile.edit"]'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Customer', 'Customer access', '["projects.view", "profile.edit"]');

-- Insert Demo Users (Note: These are just database records, not auth users)
-- The password_hash field is left NULL since Supabase Auth handles authentication
INSERT INTO users (id, organization_id, email, first_name, last_name, password_hash, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'superadmin@archer-demo.com', 'Super', 'Admin', NULL, true),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'admin@archer-demo.com', 'Admin', 'User', NULL, true),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'employee@archer-demo.com', 'John', 'Employee', NULL, true),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'contractor@archer-demo.com', 'Jane', 'Contractor', NULL, true),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'customer@archer-demo.com', 'Bob', 'Customer', NULL, true);

-- Assign Users to Roles
INSERT INTO user_roles (user_id, role_id) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001'), -- Super Admin
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002'), -- Admin
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003'), -- Employee
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004'), -- Contractor
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005'); -- Customer

-- Insert Default Menu Items
INSERT INTO menu_items (id, organization_id, parent_id, name, icon, path, order_index, required_permissions) VALUES 
-- Main menu items
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Dashboard', 'LayoutDashboard', '/dashboard', 1, '[]'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Projects', 'FolderOpen', '/projects', 2, '["projects.view"]'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Tasks', 'CheckSquare', '/tasks', 3, '["tasks.view"]'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', NULL, 'CRM', 'Users', '/crm', 4, '["crm.view"]'),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Finance', 'DollarSign', '/finance', 5, '["finance.view"]'),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Analytics', 'BarChart3', '/analytics', 6, '["analytics.view"]'),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Communication', 'MessageSquare', '/chat', 7, '[]'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Users & Roles', 'Shield', NULL, 8, '["users.view"]'),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Settings', 'Settings', '/settings', 9, '["settings.view"]');

-- Users & Roles submenu
INSERT INTO menu_items (id, organization_id, parent_id, name, icon, path, order_index, required_permissions) VALUES 
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440027', 'User & Role Management', 'Users', '/users', 1, '["users.manage"]'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440027', 'Permissions', 'Key', '/permissions', 2, '["permissions.manage"]');

-- Sample Business Metrics
INSERT INTO business_metrics (organization_id, metric_type, metric_name, metric_value, period) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'revenue', 'Monthly Revenue', 50000.00, 'monthly'),
('550e8400-e29b-41d4-a716-446655440000', 'projects', 'Active Projects', 25, 'monthly'),
('550e8400-e29b-41d4-a716-446655440000', 'tasks', 'Completed Tasks', 150, 'monthly'),
('550e8400-e29b-41d4-a716-446655440000', 'users', 'Active Users', 12, 'monthly'),
('550e8400-e29b-41d4-a716-446655440000', 'customers', 'Total Customers', 8, 'monthly');

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type) VALUES 
('550e8400-e29b-41d4-a716-446655440011', 'Welcome to Archer!', 'Welcome to your new business management system.', 'info'),
('550e8400-e29b-41d4-a716-446655440012', 'New Project Assigned', 'You have been assigned to the Website Redesign project.', 'info'),
('550e8400-e29b-41d4-a716-446655440013', 'Task Due Soon', 'Your task "Create wireframes" is due in 2 days.', 'warning'); 