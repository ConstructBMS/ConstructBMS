-- Add sticky notes support to existing notes table
-- This migration adds color, positioning, and sticky note specific fields

-- Add color column for sticky notes
ALTER TABLE notes ADD COLUMN color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'pink', 'blue', 'gray', 'green', 'orange', 'purple', 'red', 'teal', 'indigo', 'lime', 'rose'));

-- Add positioning columns for grid layout
ALTER TABLE notes ADD COLUMN position_x INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN position_y INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN width INTEGER DEFAULT 2;
ALTER TABLE notes ADD COLUMN height INTEGER DEFAULT 2;

-- Add category for organization
ALTER TABLE notes ADD COLUMN category VARCHAR(100);

-- Add project and opportunity references
ALTER TABLE notes ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE notes ADD COLUMN opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL;

-- Add attachments support
CREATE TABLE note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'document')),
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_notes_color ON notes(color);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_opportunity_id ON notes(opportunity_id);
CREATE INDEX idx_note_attachments_note_id ON note_attachments(note_id);
