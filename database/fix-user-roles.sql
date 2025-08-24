-- Fix user roles
-- Update any users with invalid roles to use valid ones

UPDATE users SET role = 'admin' WHERE role = 'super_admin';
UPDATE user_roles SET role = 'admin' WHERE role = 'super_admin';

-- Success message
SELECT 'User roles updated successfully!' as status;
