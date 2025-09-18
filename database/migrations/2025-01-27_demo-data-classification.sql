-- Migration: Add demo data classification to all tables
-- Date: 2025-01-27
-- Description: Add is_demo_data column to classify data as demo or live

-- Add is_demo_data column to projects table
ALTER TABLE projects 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to contacts table
ALTER TABLE contacts 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to tasks table
ALTER TABLE tasks 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to invoices table
ALTER TABLE invoices 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to expenses table
ALTER TABLE expenses 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to users table
ALTER TABLE users 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to documents table
ALTER TABLE documents 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to project_members table
ALTER TABLE project_members 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to task_comments table
ALTER TABLE task_comments 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to expense_attachments table
ALTER TABLE expense_attachments 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Add is_demo_data column to document_versions table
ALTER TABLE document_versions 
ADD COLUMN is_demo_data BOOLEAN DEFAULT false;

-- Create index for better performance when filtering demo data
CREATE INDEX idx_projects_is_demo_data ON projects(is_demo_data);
CREATE INDEX idx_contacts_is_demo_data ON contacts(is_demo_data);
CREATE INDEX idx_tasks_is_demo_data ON tasks(is_demo_data);
CREATE INDEX idx_invoices_is_demo_data ON invoices(is_demo_data);
CREATE INDEX idx_expenses_is_demo_data ON expenses(is_demo_data);
CREATE INDEX idx_users_is_demo_data ON users(is_demo_data);
CREATE INDEX idx_documents_is_demo_data ON documents(is_demo_data);

-- Create audit log entry for this migration
INSERT INTO audit_logs (
  action,
  description,
  user_id,
  metadata
) VALUES (
  'migration',
  'Added demo data classification columns to all tables',
  NULL,
  '{"migration": "2025-01-27_demo-data-classification", "tables_affected": 11}'
);

-- Mark all existing data as demo data (initial setup)
UPDATE projects SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE contacts SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE tasks SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE invoices SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE expenses SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE documents SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE project_members SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE task_comments SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE invoice_items SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE expense_attachments SET is_demo_data = true WHERE is_demo_data IS NULL;
UPDATE document_versions SET is_demo_data = true WHERE is_demo_data IS NULL;

-- Don't mark admin users as demo data
UPDATE users SET is_demo_data = false WHERE role IN ('super_admin', 'admin');
UPDATE users SET is_demo_data = true WHERE role NOT IN ('super_admin', 'admin') AND is_demo_data IS NULL;
