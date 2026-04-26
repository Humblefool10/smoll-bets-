import { createClient } from "@supabase/supabase-js";

// These are public keys — safe to expose in the browser.
// Security comes from Row Level Security (RLS) policies on the database,
// not from hiding these values.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
