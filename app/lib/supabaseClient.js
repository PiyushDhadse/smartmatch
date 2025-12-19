// lib/supabaseclient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Safety check to help you debug in the browser console
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env variables are missing! Check your Vercel/Local settings."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
