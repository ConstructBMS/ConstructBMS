-- Fix modules icons and routes
-- Add icons and routes to existing modules if they don't have them

UPDATE modules SET icon = 'home', route = '/dashboard' WHERE name = 'Dashboard' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'users', route = '/crm' WHERE name = 'CRM' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'folder', route = '/projects' WHERE name = 'Projects' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'check-square', route = '/tasks' WHERE name = 'Tasks' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'file', route = '/documents' WHERE name = 'Documents' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'calendar', route = '/calendar' WHERE name = 'Calendar' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'file-text', route = '/notes' WHERE name = 'Notes' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'shopping-cart', route = '/procurement' WHERE name = 'Procurement' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'help-circle', route = '/support' WHERE name = 'Support' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'message-circle', route = '/communications' WHERE name = 'Communications' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'trending-up', route = '/opportunities' WHERE name = 'Opportunities' AND (icon IS NULL OR route IS NULL);
UPDATE modules SET icon = 'settings', route = '/settings' WHERE name = 'Settings' AND (icon IS NULL OR route IS NULL);

-- Success message
SELECT 'Modules icons and routes updated successfully!' as status;
