import { supabase } from '../../../lib/supabaseClient';
import { Estimate } from '../domain/types';

export const estimatesRepo = {
  list: async (companyId: string): Promise<Estimate[]> => {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  create: async (companyId: string, title: string): Promise<Estimate> => {
    const { data, error } = await supabase
      .from('estimates')
      .insert({ company_id: companyId, title })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },
};

