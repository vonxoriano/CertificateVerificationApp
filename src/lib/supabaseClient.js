import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jncxxpxvmwuiqxzeyvvg.supabase.co';
const supabaseAnonKey = 'sb_publishable_IAfKCz-mz2O1veoDIHOsjQ_Aji01RnV';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values, then restart npm start.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);