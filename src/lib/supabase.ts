import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://zlyqcfvwghjpytpqxtgc.supabase.co',
  'sb_publishable_2PC9q_Nmiscn00aHFo16Dw_XbsmGbe7',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
