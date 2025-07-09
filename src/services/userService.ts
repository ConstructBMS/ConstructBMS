import { supabase } from './supabase';

// Get all users with no roles assigned
export async function getUsersWithNoRoles() {
  const { data, error } = await supabase.rpc('users_with_no_roles');
  if (error) throw error;
  return data;
}

// Get count of users with no roles assigned
export async function getPendingUserCount() {
  const { data, error } = await supabase.rpc('users_with_no_roles');
  if (error) throw error;
  return data ? data.length : 0;
}

// Get all available roles
export async function getAllRoles() {
  const { data, error } = await supabase.from('roles').select('id, name');
  if (error) throw error;
  return data;
}

// Assign a role to a user
export async function assignRoleToUser(userId: string, roleId: string) {
  const { error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role_id: roleId }]);
  if (error) throw error;
}
