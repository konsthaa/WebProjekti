import {createClient} from '@supabase/supabase-js';

// Set VITE_USE_DEV_DB=true in client/.env to use the VITE_DEV_* test database
const useDevDb = import.meta.env.VITE_USE_DEV_DB === 'true';

const supabaseUrl = useDevDb
  ? import.meta.env.VITE_DEV_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = useDevDb
  ? import.meta.env.VITE_DEV_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
