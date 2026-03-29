import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    if (!_supabase) {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase URL or Anon Key is missing. Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
      }
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return Reflect.get(_supabase, prop, receiver);
  }
});
