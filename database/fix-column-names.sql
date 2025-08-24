-- Fix column names and constraints
-- This script is for reference - the main fix is in the seed script

-- Note: 
-- contractors table uses 'specialties' (plural) not 'specialty' (singular)
-- consultants table uses 'expertise' not 'specialty'
-- Both are TEXT[] arrays, not VARCHAR
-- tasks table uses 'assignee_id' not 'assigned_to'
-- tasks status must be one of: ('todo', 'in_progress', 'review', 'done') - not 'pending'
-- notes table uses 'author_id' not 'created_by' and no 'project_id'
-- documents table uses 'author_id' not 'uploaded_by', 'type' not 'file_type', and no 'project_id'
-- user_roles table uses 'role_name' not 'role' and no 'updated_at'
-- user_modules table has no 'updated_at' column

-- Success message
SELECT 'All column names and constraints corrected in seed script!' as status;
