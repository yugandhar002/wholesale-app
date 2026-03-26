import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Mock mode — used when env vars are not set yet
export const IS_MOCK = !supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE';

export const supabase = IS_MOCK
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);
