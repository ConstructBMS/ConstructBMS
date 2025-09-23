-- Simple Sticky Notes Migration
-- This version doesn't require projects or opportunities tables

-- Add color column for sticky notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'pink', 'blue', 'gray', 'green', 'orange', 'purple', 'red', 'teal', 'indigo', 'lime', 'rose'));

-- Add positioning columns for grid layout
ALTER TABLE notes ADD COLUMN IF NOT EXISTS position_x INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS position_y INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS width INTEGER DEFAULT 2;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 2;

-- Add category for organization
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add project and opportunity references (optional UUIDs, no foreign keys)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS opportunity_id UUID;

-- Add attachments support
CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'document')),
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_notes_color ON notes(color);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_opportunity_id ON notes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON note_attachments(note_id);
