-- Fix menu items column names
-- This script is for reference - the main fix is in the reset script

-- Note: The menu_items table uses 'route' not 'path'
-- Column order should be: (id, name, icon, route, parent_id, module_id, order_index, is_active, created_at, updated_at)

-- Success message
SELECT 'Menu items structure corrected in reset script!' as status;
