import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type AuthUser = { id: string } | null;

export function useAuth(): {
  user: AuthUser;
  companyId: string | null;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUser>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user ? { id: data.user.id } : null;

      if (!mounted) return;
      setUser(u);

      if (!u) {
        setCompanyId(null);
        return;
      }

      const { data: membership } = await supabase
        .from('company_memberships')
        .select('company_id')
        .eq('user_id', u.id)
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      setCompanyId(
        (membership as { company_id: string } | null)?.company_id ?? null
      );
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    companyId,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
