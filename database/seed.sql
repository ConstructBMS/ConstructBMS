-- ConstructBMS Seed Data
-- This file contains initial data to populate the database

-- Insert default admin user with proper credentials
INSERT INTO users (id, email, name, password_hash, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'constructbms@gmail.com', 'Super Administrator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqK8i', 'admin');

-- Insert default modules
INSERT INTO modules (id, name, description, is_active, icon, route, permissions) VALUES
-- Main modules
('550e8400-e29b-41d4-a716-446655440001', 'Dashboard', 'Main dashboard with overview and statistics', true, 'LayoutDashboard', '/dashboard', ARRAY['view']),

('550e8400-e29b-41d4-a716-446655440002', 'Calendar', 'Calendar view for scheduling and events', true, 'Calendar', '/calendar', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440003', 'Tasks', 'Task management and tracking', true, 'CheckSquare', '/tasks', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440004', 'Notes', 'Note taking and documentation', true, 'FileText', '/notes', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440005', 'Procurement', 'Procurement and purchasing management', true, 'ShoppingCart', '/procurement', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440006', 'Support', 'Support and help system', true, 'HelpCircle', '/support', ARRAY['view']),


-- CRM modules
('550e8400-e29b-41d4-a716-446655440007', 'CRM', 'Customer Relationship Management', true, 'Users', '/crm', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440008', 'Clients', 'Client management', true, 'Users', '/crm/clients', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440009', 'Contractors', 'Contractor management', true, 'Users', '/crm/contractors', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440010', 'Consultants', 'Consultant management', true, 'Users', '/crm/consultants', ARRAY['view', 'edit', 'delete']),


-- Communication modules
('550e8400-e29b-41d4-a716-446655440011', 'Communications', 'Communication tools', true, 'MessageSquare', '/communications', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440012', 'Email', 'Email management', true, 'Mail', '/communications/email', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440013', 'Messenger', 'Internal messaging', true, 'MessageCircle', '/communications/messenger', ARRAY['view', 'edit']),


-- Project modules
('550e8400-e29b-41d4-a716-446655440014', 'Projects', 'Project management', true, 'FolderOpen', '/projects', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440015', 'Project Planner', 'Project planning and scheduling', true, 'Calendar', '/projects/planner', ARRAY['view', 'edit']),


-- Opportunity modules
('550e8400-e29b-41d4-a716-446655440016', 'Opportunities', 'Sales and opportunity management', true, 'TrendingUp', '/opportunities', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440017', 'Sales Pipeline', 'Sales pipeline management', true, 'BarChart3', '/opportunities/pipeline', ARRAY['view', 'edit']),


-- Document modules
('550e8400-e29b-41d4-a716-446655440018', 'Document Hub', 'Document management', true, 'Library', '/documents', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440019', 'Library', 'Document library', true, 'Folder', '/documents/library', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440020', 'Document Builder', 'Document creation tools', true, 'FileEdit', '/documents/builder', ARRAY['view', 'edit']),


-- Settings modules
('550e8400-e29b-41d4-a716-446655440021', 'Settings', 'System settings', true, 'Settings', '/settings', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440022', 'General Settings', 'General system settings', true, 'Settings', '/settings/general', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440023', 'Users & Roles', 'User and role management', true, 'Users', '/settings/users', ARRAY['view', 'edit', 'delete']),

('550e8400-e29b-41d4-a716-446655440024', 'Menu Builder', 'Menu customization', true, 'Menu', '/settings/menu', ARRAY['view', 'edit']),

('550e8400-e29b-41d4-a716-446655440025', 'Modules', 'Module management', true, 'Package', '/settings/modules', ARRAY['view', 'edit']);


-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address, company) VALUES
('550e8400-e29b-41d4-a716-446655440026', 'John Smith', 'john.smith@abc-corp.com', '+44 20 7123 4567', '123 Business Street, London, UK', 'ABC Corporation'),

('550e8400-e29b-41d4-a716-446655440027', 'Sarah Johnson', 'sarah.johnson@xyz-dev.com', '+44 20 7123 4568', '456 Development Ave, Manchester, UK', 'XYZ Developers'),

('550e8400-e29b-41d4-a716-446655440028', 'Michael Brown', 'michael.brown@retail-group.com', '+44 20 7123 4569', '789 Retail Road, Birmingham, UK', 'Retail Group Ltd');


-- Insert sample projects
INSERT INTO projects (id, name, description, status, client_id, start_date, end_date, budget) VALUES
('550e8400-e29b-41d4-a716-446655440029', 'Office Building Renovation', 'Complete renovation of 3-story office building in central London', 'in_progress', '550e8400-e29b-41d4-a716-446655440026', '2024-01-01', '2024-06-30', 250000.00),

('550e8400-e29b-41d4-a716-446655440030', 'Residential Complex', 'Construction of 50-unit residential complex with amenities', 'planning', '550e8400-e29b-41d4-a716-446655440027', '2024-03-01', '2025-02-28', 1500000.00),

('550e8400-e29b-41d4-a716-446655440031', 'Shopping Center', 'Modern shopping center with parking and food court', 'completed', '550e8400-e29b-41d4-a716-446655440028', '2023-06-01', '2024-01-31', 800000.00);


-- Insert sample tasks
INSERT INTO tasks (id, title, description, status, priority, assignee_id, project_id, due_date) VALUES
('550e8400-e29b-41d4-a716-446655440032', 'Review construction plans', 'Review and approve final construction plans for office renovation', 'todo', 'high', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440029', '2024-01-15'),

('550e8400-e29b-41d4-a716-446655440033', 'Client meeting', 'Initial client meeting for residential complex project', 'todo', 'medium', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', '2024-01-16'),

('550e8400-e29b-41d4-a716-446655440034', 'Material procurement', 'Procure materials for shopping center project', 'done', 'low', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', '2024-01-10');


-- Insert sample notes
INSERT INTO notes (id, title, content, tags, author_id) VALUES
('550e8400-e29b-41d4-a716-446655440035', 'Project Kickoff Meeting Notes', 'Discussed project timeline, budget, and key milestones. Team assigned and roles defined.', ARRAY['meeting', 'kickoff', 'planning'], '550e8400-e29b-41d4-a716-446655440000'),

('550e8400-e29b-41d4-a716-446655440036', 'Site Inspection Report', 'Completed site inspection for office renovation. Identified structural issues that need attention.', ARRAY['inspection', 'structural', 'issues'], '550e8400-e29b-41d4-a716-446655440000'),

('550e8400-e29b-41d4-a716-446655440037', 'Budget Review', 'Reviewed project budget and identified potential cost savings opportunities.', ARRAY['budget', 'review', 'cost-savings'], '550e8400-e29b-41d4-a716-446655440000');


-- Insert sample documents
INSERT INTO documents (id, title, content, type, tags, author_id) VALUES
('550e8400-e29b-41d4-a716-446655440038', 'Office Renovation Contract', 'Contract for office building renovation project including terms, conditions, and payment schedule.', 'contract', ARRAY['contract', 'office', 'renovation'], '550e8400-e29b-41d4-a716-446655440000'),

('550e8400-e29b-41d4-a716-446655440039', 'Residential Complex Proposal', 'Detailed proposal for residential complex construction including design, timeline, and cost breakdown.', 'proposal', ARRAY['proposal', 'residential', 'complex'], '550e8400-e29b-41d4-a716-446655440000'),

('550e8400-e29b-41d4-a716-446655440040', 'Shopping Center Invoice', 'Invoice for completed shopping center project with detailed cost breakdown.', 'invoice', ARRAY['invoice', 'shopping-center', 'completed'], '550e8400-e29b-41d4-a716-446655440000');


-- Grant admin user access to all modules
INSERT INTO user_modules (user_id, module_id, can_access, can_edit, can_delete)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000' as user_id,
    id as module_id,
    true as can_access,
    true as can_edit,
    true as can_delete
FROM modules;
