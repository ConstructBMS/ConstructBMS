-- Create sticky_notes table
CREATE TABLE IF NOT EXISTS sticky_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    color VARCHAR(7) NOT NULL DEFAULT '#fef3c7', -- hex color
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_demo_data BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sticky_notes_user_id ON sticky_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_sticky_notes_project_id ON sticky_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_sticky_notes_contact_id ON sticky_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_sticky_notes_is_pinned ON sticky_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_sticky_notes_updated_at ON sticky_notes(updated_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_sticky_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sticky_notes_updated_at
    BEFORE UPDATE ON sticky_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_sticky_notes_updated_at();

-- Insert some demo sticky notes
INSERT INTO sticky_notes (title, content, color, is_pinned, tags, user_id, is_demo_data) VALUES
(
    'Project Kickoff Meeting',
    '<p><strong>Meeting Notes:</strong></p><ul><li>Review project scope</li><li>Assign team members</li><li>Set timeline milestones</li></ul><p><em>Next meeting: Friday 2 PM</em></p>',
    '#dbeafe',
    true,
    ARRAY['meeting', 'project', 'kickoff'],
    (SELECT id FROM users WHERE email = 'constructbms@gmail.com' LIMIT 1),
    true
),
(
    'Client Feedback',
    '<p><strong>ABC Construction Feedback:</strong></p><p>Client is happy with progress but wants to discuss budget adjustments for phase 2.</p><p><u>Action items:</u></p><ol><li>Schedule budget review meeting</li><li>Prepare revised estimates</li><li>Update project timeline</li></ol>',
    '#dcfce7',
    false,
    ARRAY['client', 'feedback', 'budget'],
    (SELECT id FROM users WHERE email = 'constructbms@gmail.com' LIMIT 1),
    true
),
(
    'Safety Checklist',
    '<p><strong>Weekly Safety Review:</strong></p><ul><li>✓ Hard hats required on site</li><li>✓ Safety barriers in place</li><li>✓ First aid kit stocked</li><li>⚠️ Need to replace damaged safety signs</li></ul>',
    '#fef2f2',
    true,
    ARRAY['safety', 'checklist', 'weekly'],
    (SELECT id FROM users WHERE email = 'constructbms@gmail.com' LIMIT 1),
    true
),
(
    'Material Order',
    '<p><strong>Pending Material Orders:</strong></p><ol><li>Concrete - 50 cubic meters</li><li>Steel beams - 20 units</li><li>Electrical supplies - pending quote</li></ol><p><em>Deadline: End of week</em></p>',
    '#fce7f3',
    false,
    ARRAY['materials', 'orders', 'procurement'],
    (SELECT id FROM users WHERE email = 'constructbms@gmail.com' LIMIT 1),
    true
),
(
    'Team Meeting Agenda',
    '<p><strong>Weekly Team Meeting - Monday 9 AM</strong></p><p><strong>Agenda:</strong></p><ol><li>Project status updates</li><li>Budget review</li><li>Timeline adjustments</li><li>Safety concerns</li><li>Next week priorities</li></ol>',
    '#e0e7ff',
    false,
    ARRAY['meeting', 'agenda', 'team'],
    (SELECT id FROM users WHERE email = 'constructbms@gmail.com' LIMIT 1),
    true
);
