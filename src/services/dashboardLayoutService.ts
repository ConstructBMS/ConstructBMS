import { supabase } from './supabase';

const TABLE = 'dashboard_layouts';

export async function getDashboardLayout(userId: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    throw error;
  }
  return data?.data ?? null;
}

export async function saveDashboardLayout(userId: string, layout: any) {
  // Upsert: insert or update
  const { error } = await supabase
    .from(TABLE)
    .upsert([{ user_id: userId, data: layout }], { onConflict: 'user_id' });
  if (error) throw error;
}
