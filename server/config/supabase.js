const path = require('node:path');
const {createClient} = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({path: path.resolve(__dirname, '../.env')});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env',
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {Authorization: `Bearer ${accessToken}`},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

module.exports = {supabase, createUserClient};
