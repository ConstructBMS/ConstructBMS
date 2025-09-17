-- Demo financial data for dashboard analytics
-- This file contains sample data for invoices, expenses, and revenue

-- Insert demo clients first (if not already exists)
INSERT INTO clients (id, name, email, phone, company) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction', 'contact@abcconstruction.com', '+1-555-0101', 'ABC Construction Ltd'),
('550e8400-e29b-41d4-a716-446655440002', 'XYZ Builders', 'info@xyzbuilders.com', '+1-555-0102', 'XYZ Builders Inc'),
('550e8400-e29b-41d4-a716-446655440003', 'Metro Developers', 'hello@metrodev.com', '+1-555-0103', 'Metro Developers LLC'),
('550e8400-e29b-41d4-a716-446655440004', 'City Contractors', 'contact@citycontractors.com', '+1-555-0104', 'City Contractors Group')
ON CONFLICT (email) DO NOTHING;

-- Insert demo projects first (if not already exists)
INSERT INTO projects (id, name, description, status, client_id, start_date, end_date, budget) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Office Building', 'Modern office complex construction', 'in_progress', '550e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-06-30', 150000.00),
('660e8400-e29b-41d4-a716-446655440002', 'Warehouse Project', 'Industrial warehouse facility', 'in_progress', '550e8400-e29b-41d4-a716-446655440002', '2024-02-01', '2024-07-31', 95000.00),
('660e8400-e29b-41d4-a716-446655440003', 'Retail Space', 'Shopping center development', 'completed', '550e8400-e29b-41d4-a716-446655440003', '2023-10-01', '2024-01-15', 75000.00),
('660e8400-e29b-41d4-a716-446655440004', 'Apartment Complex', 'Residential apartment building', 'planning', '550e8400-e29b-41d4-a716-446655440004', '2024-03-01', '2024-12-31', 200000.00)
ON CONFLICT (id) DO NOTHING;

-- Insert demo invoices
INSERT INTO invoices (id, invoice_number, client_id, project_id, amount, status, issue_date, due_date, paid_date) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'INV-2024-001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 12500.00, 'overdue', '2023-12-15', '2024-01-15', NULL),
('770e8400-e29b-41d4-a716-446655440002', 'INV-2024-002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 8750.00, 'pending', '2024-01-01', '2024-01-20', NULL),
('770e8400-e29b-41d4-a716-446655440003', 'INV-2024-003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 15200.00, 'pending', '2024-01-05', '2024-01-25', NULL),
('770e8400-e29b-41d4-a716-446655440004', 'INV-2024-004', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 6800.00, 'pending', '2024-01-10', '2024-01-30', NULL),
('770e8400-e29b-41d4-a716-446655440005', 'INV-2023-120', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 32000.00, 'paid', '2023-12-01', '2023-12-31', '2023-12-28'),
('770e8400-e29b-41d4-a716-446655440006', 'INV-2023-121', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 28000.00, 'paid', '2023-11-15', '2023-12-15', '2023-12-10'),
('770e8400-e29b-41d4-a716-446655440007', 'INV-2023-122', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 35000.00, 'paid', '2023-10-20', '2023-11-20', '2023-11-15'),
('770e8400-e29b-41d4-a716-446655440008', 'INV-2023-123', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 42000.00, 'paid', '2023-09-10', '2023-10-10', '2023-10-05'),
('770e8400-e29b-41d4-a716-446655440009', 'INV-2023-124', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 38000.00, 'paid', '2023-08-15', '2023-09-15', '2023-09-10'),
('770e8400-e29b-41d4-a716-446655440010', 'INV-2023-125', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 45000.00, 'paid', '2023-07-20', '2023-08-20', '2023-08-15');

-- Insert demo expenses
INSERT INTO expenses (id, description, amount, category, project_id, vendor, expense_date) VALUES
-- Materials expenses
('880e8400-e29b-41d4-a716-446655440001', 'Concrete delivery', 2500.00, 'materials', '660e8400-e29b-41d4-a716-446655440001', 'Concrete Supply Co', '2024-01-15'),
('880e8400-e29b-41d4-a716-446655440002', 'Steel beams', 3200.00, 'materials', '660e8400-e29b-41d4-a716-446655440001', 'Steel Works Inc', '2024-01-10'),
('880e8400-e29b-41d4-a716-446655440003', 'Electrical wiring', 1800.00, 'materials', '660e8400-e29b-41d4-a716-446655440002', 'Electric Supply', '2024-01-12'),
('880e8400-e29b-41d4-a716-446655440004', 'Lumber and wood', 2200.00, 'materials', '660e8400-e29b-41d4-a716-446655440002', 'Lumber Yard', '2024-01-08'),
('880e8400-e29b-41d4-a716-446655440005', 'Insulation materials', 1500.00, 'materials', '660e8400-e29b-41d4-a716-446655440003', 'Insulation Pro', '2024-01-05'),
('880e8400-e29b-41d4-a716-446655440006', 'Roofing materials', 2800.00, 'materials', '660e8400-e29b-41d4-a716-446655440003', 'Roof Supply', '2024-01-03'),

-- Labor expenses
('880e8400-e29b-41d4-a716-446655440007', 'Construction crew wages', 4500.00, 'labor', '660e8400-e29b-41d4-a716-446655440001', 'Internal', '2024-01-15'),
('880e8400-e29b-41d4-a716-446655440008', 'Electrician labor', 2800.00, 'labor', '660e8400-e29b-41d4-a716-446655440002', 'Internal', '2024-01-12'),
('880e8400-e29b-41d4-a716-446655440009', 'Plumber labor', 2200.00, 'labor', '660e8400-e29b-41d4-a716-446655440002', 'Internal', '2024-01-10'),
('880e8400-e29b-41d4-a716-446655440010', 'Carpenter labor', 1800.00, 'labor', '660e8400-e29b-41d4-a716-446655440003', 'Internal', '2024-01-08'),

-- Equipment expenses
('880e8400-e29b-41d4-a716-446655440011', 'Crane rental', 1200.00, 'equipment', '660e8400-e29b-41d4-a716-446655440001', 'Equipment Rentals', '2024-01-14'),
('880e8400-e29b-41d4-a716-446655440012', 'Excavator rental', 800.00, 'equipment', '660e8400-e29b-41d4-a716-446655440002', 'Heavy Equipment Co', '2024-01-11'),
('880e8400-e29b-41d4-a716-446655440013', 'Generator rental', 600.00, 'equipment', '660e8400-e29b-41d4-a716-446655440003', 'Power Solutions', '2024-01-09'),
('880e8400-e29b-41d4-a716-446655440014', 'Concrete mixer rental', 400.00, 'equipment', '660e8400-e29b-41d4-a716-446655440001', 'Mixer Rentals', '2024-01-07'),

-- Overhead expenses
('880e8400-e29b-41d4-a716-446655440015', 'Office rent', 1200.00, 'overhead', NULL, 'Property Management', '2024-01-01'),
('880e8400-e29b-41d4-a716-446655440016', 'Insurance premium', 800.00, 'overhead', NULL, 'Insurance Co', '2024-01-01'),
('880e8400-e29b-41d4-a716-446655440017', 'Utilities', 600.00, 'overhead', NULL, 'Utility Company', '2024-01-15'),
('880e8400-e29b-41d4-a716-446655440018', 'Software licenses', 400.00, 'overhead', NULL, 'Software Vendor', '2024-01-01'),

-- Subcontractor expenses
('880e8400-e29b-41d4-a716-446655440019', 'Landscaping work', 1800.00, 'subcontractors', '660e8400-e29b-41d4-a716-446655440001', 'Green Thumb Landscaping', '2024-01-13'),
('880e8400-e29b-41d4-a716-446655440020', 'HVAC installation', 2400.00, 'subcontractors', '660e8400-e29b-41d4-a716-446655440002', 'Climate Control Inc', '2024-01-11'),
('880e8400-e29b-41d4-a716-446655440021', 'Flooring installation', 1400.00, 'subcontractors', '660e8400-e29b-41d4-a716-446655440003', 'Floor Masters', '2024-01-09');

-- Insert demo revenue
INSERT INTO revenue (id, amount, source, project_id, invoice_id, revenue_date) VALUES
-- Revenue from paid invoices
('990e8400-e29b-41d4-a716-446655440001', 32000.00, 'Office Building Project', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', '2023-12-28'),
('990e8400-e29b-41d4-a716-446655440002', 28000.00, 'Warehouse Project', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', '2023-12-10'),
('990e8400-e29b-41d4-a716-446655440003', 35000.00, 'Retail Space Project', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', '2023-11-15'),
('990e8400-e29b-41d4-a716-446655440004', 42000.00, 'Apartment Complex Project', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440008', '2023-10-05'),
('990e8400-e29b-41d4-a716-446655440005', 38000.00, 'Office Building Project', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440009', '2023-09-10'),
('990e8400-e29b-41d4-a716-446655440006', 45000.00, 'Warehouse Project', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440010', '2023-08-15'),

-- Additional revenue entries for better chart data
('990e8400-e29b-41d4-a716-446655440007', 32000.00, 'Office Building Project', '660e8400-e29b-41d4-a716-446655440001', NULL, '2024-01-01'),
('990e8400-e29b-41d4-a716-446655440008', 28000.00, 'Warehouse Project', '660e8400-e29b-41d4-a716-446655440002', NULL, '2024-01-01'),
('990e8400-e29b-41d4-a716-446655440009', 35000.00, 'Retail Space Project', '660e8400-e29b-41d4-a716-446655440003', NULL, '2024-01-01'),
('990e8400-e29b-41d4-a716-446655440010', 42000.00, 'Apartment Complex Project', '660e8400-e29b-41d4-a716-446655440004', NULL, '2024-01-01'),
('990e8400-e29b-41d4-a716-446655440011', 38000.00, 'Office Building Project', '660e8400-e29b-41d4-a716-446655440001', NULL, '2024-01-01'),
('990e8400-e29b-41d4-a716-446655440012', 45000.00, 'Warehouse Project', '660e8400-e29b-41d4-a716-446655440002', NULL, '2024-01-01');
