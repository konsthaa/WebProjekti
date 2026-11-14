const path = require('node:path');
const {createClient} = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({path: path.resolve(__dirname, '../.env')});

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Set SUPABASE_URL and SUPABASE_ANON_KEY (or their VITE_ equivalents) in .env',
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {supabase};
