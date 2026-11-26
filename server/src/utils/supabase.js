import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Local development reads server/.env. In Azure the values come from
// the App Service application settings (process.env), so a missing file is OK.
dotenv.config({path: path.resolve(__dirname, '../../.env'), quiet: true});

// Set USE_DEV_DB=true in server/.env to use the DEV_SUPABASE_* test database
const useDevDb = process.env.USE_DEV_DB === 'true';

const supabaseUrl = useDevDb
  ? process.env.DEV_SUPABASE_URL
  : process.env.SUPABASE_URL;
const supabaseAnonKey = useDevDb
  ? process.env.DEV_SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    useDevDb
      ? 'Set DEV_SUPABASE_URL and DEV_SUPABASE_ANON_KEY in server/.env'
      : 'Set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env',
  );
}

if (useDevDb) console.log('Using the DEV Supabase database');

// Client for public (anonymous) queries
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client that acts as the signed-in user, so Supabase RLS applies
const createUserClient = (accessToken) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: {headers: {Authorization: `Bearer ${accessToken}`}},
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

export {supabase, createUserClient};
