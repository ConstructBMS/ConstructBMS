-- Demo sticky notes for development/testing
-- Insert demo notes with the demo user ID

INSERT INTO notes (id, title, content, color, tags, author_id, created_at, updated_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Welcome to ConstructBMS',
    '<p><strong>Getting Started:</strong></p><ul><li>Explore the dashboard</li><li>Create your first project</li><li>Add team members</li><li>Set up your workflow</li></ul><p><em>Happy building! 🏗️</em></p>',
    'yellow',
    ARRAY['welcome', 'getting-started'],
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Project Kickoff Meeting',
    '<p><strong>Meeting Notes:</strong></p><ul><li>Review project scope and timeline</li><li>Assign team members to tasks</li><li>Set up communication channels</li><li>Schedule weekly check-ins</li></ul><p><strong>Next Steps:</strong></p><ol><li>Finalize budget approval</li><li>Order materials</li><li>Schedule site inspection</li></ol>',
    'blue',
    ARRAY['meeting', 'project', 'kickoff'],
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Client Feedback - ABC Construction',
    '<p><strong>Client Meeting Summary:</strong></p><p>Client is very happy with the progress on the office building project. They particularly appreciate the attention to detail in the foundation work.</p><p><strong>Feedback:</strong></p><ul><li>✅ Excellent communication</li><li>✅ Quality workmanship</li><li>✅ On-time delivery so far</li></ul><p><strong>Requests:</strong></p><ul><li>Consider adding solar panels to the roof</li><li>Discuss landscaping options</li><li>Review final walkthrough schedule</li></ul>',
    'green',
    ARRAY['client', 'feedback', 'positive'],
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Safety Checklist - Week 3',
    '<p><strong>Weekly Safety Review:</strong></p><ul><li>✅ Hard hats required on site</li><li>✅ Safety barriers in place</li><li>✅ First aid kit stocked and accessible</li><li>✅ Emergency procedures posted</li><li>⚠️ Need to replace damaged safety signs</li><li>⚠️ Schedule safety training for new workers</li></ul><p><strong>Action Items:</strong></p><ol><li>Order new safety signs</li><li>Schedule training session</li><li>Review incident reports</li></ol>',
    'red',
    ARRAY['safety', 'checklist', 'weekly'],
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Material Order Status',
    '<p><strong>Pending Material Orders:</strong></p><ol><li><strong>Concrete</strong> - 50 cubic meters (Ordered: Jan 15, Expected: Jan 25)</li><li><strong>Steel Beams</strong> - 20 units (Ordered: Jan 10, Expected: Jan 20)</li><li><strong>Electrical Supplies</strong> - Pending quote from supplier</li><li><strong>Insulation</strong> - 1000 sq ft (Ordered: Jan 12, Expected: Jan 22)</li></ol><p><strong>Urgent:</strong> Need to confirm electrical quote by end of week</p>',
    'orange',
    ARRAY['materials', 'orders', 'procurement'],
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'Team Meeting Agenda - Monday',
    '<p><strong>Weekly Team Meeting - Monday 9:00 AM</strong></p><p><strong>Agenda:</strong></p><ol><li>Project status updates (15 min)</li><li>Budget review and adjustments (10 min)</li><li>Timeline updates and delays (10 min)</li><li>Safety concerns and improvements (10 min)</li><li>Next week priorities (10 min)</li><li>Open discussion (5 min)</li></ol><p><strong>Attendees:</strong> Project Manager, Site Supervisor, Safety Officer, Lead Architect</p>',
    'purple',
    ARRAY['meeting', 'agenda', 'team'],
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
);
