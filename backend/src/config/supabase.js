const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasUrl = !!supabaseUrl;
const hasServiceKey = !!supabaseServiceKey;

if (!hasUrl || !hasServiceKey) {
  console.error("Supabase env vars missing or empty:", {
    hasUrl,
    hasServiceKey,
  });
  throw new Error(
    "Missing Supabase environment variables. Expected SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
  );
}

// Service role client for backend operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabase };
