-- Migration: 2025-09-07_contacts.sql
-- Description: Create tables for contacts and companies management
-- Author: ConstructBMS
-- Date: 2025-09-07

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('person', 'company')),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_companies_custom ON companies USING GIN(custom);

CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_custom ON contacts USING GIN(custom);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for development
INSERT INTO companies (id, name, email, phone, website, address, notes, tags) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', 'contact@techcorp.com', '+1-555-0100', 'https://techcorp.com', '456 Tech Ave, Silicon Valley, CA 94000', 'Technology consulting firm.', ARRAY['technology', 'consulting']),
    ('550e8400-e29b-41d4-a716-446655440002', 'GreenBuild Inc', 'hello@greenbuild.com', '+1-555-0200', 'https://greenbuild.com', '789 Eco St, Portland, OR 97200', 'Sustainable construction company.', ARRAY['sustainable', 'construction']),
    ('550e8400-e29b-41d4-a716-446655440003', 'ABC Construction', 'info@abcconstruction.com', '+1-555-0200', 'https://abcconstruction.com', '123 Main St, City, State 12345', 'General contractor specializing in commercial buildings.', ARRAY['contractor', 'commercial'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts (id, company_id, type, name, email, phone, notes, tags) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'person', 'John Smith', 'john@example.com', '+1-555-0123', 'Project manager for the downtown office.', ARRAY['manager', 'downtown']),
    ('550e8400-e29b-41d4-a716-446655440012', NULL, 'person', 'Sarah Johnson', 'sarah@example.com', '+1-555-0124', 'Lead architect with 10+ years experience.', ARRAY['architect', 'senior']),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'company', 'ABC Construction', 'info@abcconstruction.com', '+1-555-0200', 'General contractor specializing in commercial buildings.', ARRAY['contractor', 'commercial'])
ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Stores company information and details';
COMMENT ON TABLE contacts IS 'Stores contact information for both individuals and companies';

COMMENT ON COLUMN companies.id IS 'Unique identifier for the company';
COMMENT ON COLUMN companies.name IS 'Company name';
COMMENT ON COLUMN companies.email IS 'Primary email address';
COMMENT ON COLUMN companies.phone IS 'Primary phone number';
COMMENT ON COLUMN companies.website IS 'Company website URL';
COMMENT ON COLUMN companies.address IS 'Company address';
COMMENT ON COLUMN companies.notes IS 'Additional notes about the company';
COMMENT ON COLUMN companies.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN companies.custom IS 'Custom fields stored as JSON';
COMMENT ON COLUMN companies.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN companies.updated_at IS 'Timestamp when the record was last updated';

COMMENT ON COLUMN contacts.id IS 'Unique identifier for the contact';
COMMENT ON COLUMN contacts.company_id IS 'Reference to the company this contact belongs to';
COMMENT ON COLUMN contacts.type IS 'Type of contact: person or company';
COMMENT ON COLUMN contacts.name IS 'Contact name';
COMMENT ON COLUMN contacts.email IS 'Contact email address';
COMMENT ON COLUMN contacts.phone IS 'Contact phone number';
COMMENT ON COLUMN contacts.notes IS 'Additional notes about the contact';
COMMENT ON COLUMN contacts.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN contacts.custom IS 'Custom fields stored as JSON';
COMMENT ON COLUMN contacts.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN contacts.updated_at IS 'Timestamp when the record was last updated';
