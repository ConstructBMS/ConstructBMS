-- Complete Reset and Seed Script
-- This script clears all existing data and then seeds fresh data

-- Step 1: Clear all existing data (in correct order due to foreign key constraints)
DELETE FROM user_modules;
DELETE FROM user_roles;
DELETE FROM tasks;
DELETE FROM notes;
DELETE FROM documents;
DELETE FROM projects;
DELETE FROM clients;
DELETE FROM contractors;
DELETE FROM consultants;
DELETE FROM menu_items;
DELETE FROM modules;
DELETE FROM users;

-- Step 2: Reset sequences (if any)
-- Note: Since we're using UUIDs, sequences aren't needed, but this is good practice

-- Step 3: Insert fresh seed data

-- Insert modules
INSERT INTO modules (id, name, description, icon, route, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Dashboard', 'Main dashboard module', 'home', '/dashboard', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'CRM', 'Customer Relationship Management', 'users', '/crm', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Projects', 'Project management module', 'folder', '/projects', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Tasks', 'Task management module', 'check-square', '/tasks', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Documents', 'Document management module', 'file', '/documents', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Calendar', 'Calendar and scheduling module', 'calendar', '/calendar', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Notes', 'Notes and documentation module', 'file-text', '/notes', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Procurement', 'Procurement and purchasing module', 'shopping-cart', '/procurement', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Support', 'Customer support module', 'help-circle', '/support', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Communications', 'Communication tools module', 'message-circle', '/communications', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'Opportunities', 'Sales pipeline module', 'trending-up', '/opportunities', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Settings', 'System settings module', 'settings', '/settings', true, NOW(), NOW());

-- Insert users (with password hash)
INSERT INTO users (id, email, name, password_hash, role, avatar, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'constructbms@gmail.com', 'Super Administrator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqK8i', 'admin', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'admin@constructbms.com', 'System Administrator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqK8i', 'admin', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'manager@constructbms.com', 'Project Manager', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqK8i', 'manager', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'user@constructbms.com', 'Regular User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqK8i', 'user', NULL, NOW(), NOW());

-- Insert menu items
INSERT INTO menu_items (id, name, icon, route, parent_id, module_id, order_index, is_active, created_at, updated_at) VALUES
-- Main menu items
('550e8400-e29b-41d4-a716-446655440016', 'Dashboard', 'home', '/dashboard', NULL, '550e8400-e29b-41d4-a716-446655440001', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'Calendar', 'calendar', '/calendar', NULL, '550e8400-e29b-41d4-a716-446655440006', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'Tasks', 'check-square', '/tasks', NULL, '550e8400-e29b-41d4-a716-446655440004', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440019', 'Notes', 'file-text', '/notes', NULL, '550e8400-e29b-41d4-a716-446655440007', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440020', 'Procurement', 'shopping-cart', '/procurement', NULL, '550e8400-e29b-41d4-a716-446655440008', 5, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'Support', 'help-circle', '/support', NULL, '550e8400-e29b-41d4-a716-446655440009', 6, true, NOW(), NOW()),

-- CRM submenu
('550e8400-e29b-41d4-a716-446655440022', 'CRM', 'users', '/crm', NULL, '550e8400-e29b-41d4-a716-446655440002', 7, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'Clients', 'user', '/crm/clients', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'Contractors', 'users', '/crm/contractors', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440025', 'Consultants', 'user-check', '/crm/consultants', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 3, true, NOW(), NOW()),

-- Communications submenu
('550e8400-e29b-41d4-a716-446655440026', 'Communications', 'message-circle', '/communications', NULL, '550e8400-e29b-41d4-a716-446655440010', 8, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440027', 'Email', 'mail', '/communications/email', '550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440010', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440028', 'Messenger', 'message-square', '/communications/messenger', '550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440010', 2, true, NOW(), NOW()),

-- Projects submenu
('550e8400-e29b-41d4-a716-446655440029', 'Projects', 'folder', '/projects', NULL, '550e8400-e29b-41d4-a716-446655440003', 9, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440030', 'Projects', 'folder-open', '/projects/list', '550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440003', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440031', 'Project Planner', 'calendar', '/projects/planner', '550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440003', 2, true, NOW(), NOW()),

-- Opportunities submenu
('550e8400-e29b-41d4-a716-446655440032', 'Opportunities', 'trending-up', '/opportunities', NULL, '550e8400-e29b-41d4-a716-446655440011', 10, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440033', 'Sales Pipeline', 'bar-chart', '/opportunities/pipeline', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440011', 1, true, NOW(), NOW()),

-- Document Hub submenu
('550e8400-e29b-41d4-a716-446655440034', 'Document Hub', 'file', '/documents', NULL, '550e8400-e29b-41d4-a716-446655440005', 11, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440035', 'Library', 'folder', '/documents/library', '550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440005', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440036', 'Document Builder', 'edit', '/documents/builder', '550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440005', 2, true, NOW(), NOW()),

-- Settings submenu
('550e8400-e29b-41d4-a716-446655440037', 'Settings', 'settings', '/settings', NULL, '550e8400-e29b-41d4-a716-446655440012', 12, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440038', 'General Settings', 'settings', '/settings/general', '550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440012', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440039', 'Users & Roles', 'users', '/settings/users', '550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440012', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440040', 'Menu Builder', 'menu', '/settings/menu', '550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440012', 3, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440041', 'Modules', 'package', '/settings/modules', '550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440012', 4, true, NOW(), NOW());

-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address, company, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440042', 'ABC Construction Ltd', 'contact@abc-construction.com', '+44 20 7123 4567', '123 Building Street, London, UK', 'ABC Construction Ltd', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440043', 'XYZ Development Corp', 'info@xyz-dev.com', '+44 20 7123 4568', '456 Development Avenue, Manchester, UK', 'XYZ Development Corp', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440044', 'Metro Builders', 'hello@metro-builders.com', '+44 20 7123 4569', '789 Construction Road, Birmingham, UK', 'Metro Builders', NOW(), NOW());

-- Insert sample contractors
INSERT INTO contractors (id, name, email, phone, address, company, specialty, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440045', 'Elite Electrical', 'contact@elite-electrical.com', '+44 20 7123 4570', '321 Electric Street, London, UK', 'Elite Electrical Ltd', 'Electrical', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440046', 'PlumbPro Services', 'info@plumbpro.com', '+44 20 7123 4571', '654 Plumbing Avenue, Manchester, UK', 'PlumbPro Services Ltd', 'Plumbing', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440047', 'SteelWorks Construction', 'hello@steelworks.com', '+44 20 7123 4572', '987 Steel Road, Birmingham, UK', 'SteelWorks Construction Ltd', 'Structural Steel', NOW(), NOW());

-- Insert sample consultants
INSERT INTO consultants (id, name, email, phone, address, company, specialty, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440048', 'Architectural Solutions', 'contact@arch-solutions.com', '+44 20 7123 4573', '147 Architecture Street, London, UK', 'Architectural Solutions Ltd', 'Architecture', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440049', 'Engineering Excellence', 'info@eng-excellence.com', '+44 20 7123 4574', '258 Engineering Avenue, Manchester, UK', 'Engineering Excellence Ltd', 'Structural Engineering', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440050', 'Design Dynamics', 'hello@design-dynamics.com', '+44 20 7123 4575', '369 Design Road, Birmingham, UK', 'Design Dynamics Ltd', 'Interior Design', NOW(), NOW());

-- Insert sample projects
INSERT INTO projects (id, name, description, client_id, status, start_date, end_date, budget, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440051', 'Office Complex Development', 'Modern office complex with 20 floors', '550e8400-e29b-41d4-a716-446655440042', 'in_progress', '2024-01-15', '2025-06-30', 5000000.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440052', 'Residential Tower', 'Luxury residential tower with 150 units', '550e8400-e29b-41d4-a716-446655440043', 'planning', '2024-03-01', '2026-12-31', 8000000.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440053', 'Shopping Center', 'Multi-level shopping center with parking', '550e8400-e29b-41d4-a716-446655440044', 'completed', '2023-06-01', '2024-05-31', 3000000.00, NOW(), NOW());

-- Insert sample tasks
INSERT INTO tasks (id, title, description, project_id, assigned_to, status, priority, due_date, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440054', 'Site Survey', 'Conduct initial site survey and soil testing', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440014', 'in_progress', 'high', '2024-02-15', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440055', 'Foundation Work', 'Complete foundation and basement construction', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440014', 'pending', 'high', '2024-03-30', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440056', 'Electrical Installation', 'Install electrical systems and wiring', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440015', 'pending', 'medium', '2024-04-15', NOW(), NOW());

-- Insert sample notes
INSERT INTO notes (id, title, content, project_id, created_by, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440057', 'Site Visit Notes', 'Site visit completed on 2024-01-20. Soil conditions are suitable for foundation work. No major obstacles identified.', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440014', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440058', 'Client Meeting Summary', 'Met with client to discuss project timeline and budget. Client is satisfied with current progress.', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440014', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440059', 'Safety Protocol', 'Updated safety protocols for the construction site. All workers must attend safety briefing before starting work.', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440013', NOW(), NOW());

-- Insert sample documents
INSERT INTO documents (id, title, file_path, file_type, project_id, uploaded_by, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440060', 'Project Blueprint', '/documents/blueprint.pdf', 'pdf', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440014', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440061', 'Contract Agreement', '/documents/contract.pdf', 'pdf', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440013', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440062', 'Safety Guidelines', '/documents/safety.pdf', 'pdf', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440013', NOW(), NOW());

-- Insert user-module relationships
INSERT INTO user_modules (user_id, module_id, created_at, updated_at) VALUES
-- Super admin has access to all modules
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440009', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', NOW(), NOW()),

-- Admin has access to most modules
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440006', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440008', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440009', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440011', NOW(), NOW()),

-- Manager has access to project-related modules
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440006', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW()),

-- Regular user has limited access
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW());

-- Insert user roles
INSERT INTO user_roles (user_id, role, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'admin', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'manager', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'user', NOW(), NOW());

-- Success message
SELECT 'Database reset and seeded successfully!' as status;
