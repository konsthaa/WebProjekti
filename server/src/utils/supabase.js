import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Local development reads server/.env. In Azure the values come from
// the App Service application settings (process.env), so a missing file is OK.
dotenv.config({path: path.resolve(__dirname, '../../.env'), quiet: true});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env');
}

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
