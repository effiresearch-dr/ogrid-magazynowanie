import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && 
         !!supabaseAnonKey && 
         supabaseUrl.startsWith('https://') && 
         !supabaseUrl.includes('YOUR_SUPABASE_URL');
};

// Initialize only if configured to avoid "supabaseUrl is required" error on load
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get: (_, prop) => {
        if (prop === 'auth') {
          return new Proxy({}, {
            get: (_, authProp) => {
              if (authProp === 'onAuthStateChange') return () => ({ data: { subscription: { unsubscribe: () => {} } } });
              if (authProp === 'getSession') return async () => ({ data: { session: null } });
              return () => { throw new Error('Supabase not configured'); };
            }
          });
        }
        if (prop === 'from') return () => ({ select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) });
        return () => { throw new Error('Supabase not configured'); };
      }
    }) as ReturnType<typeof createClient>;
