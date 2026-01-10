// config/supabase.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // We'll handle sessions manually
  },
  global: {
    headers: {
      "x-application-name": "smartmatch-backend",
    },
    db: { schema: "public" },
    auth: { persistSession: false },
  },
});

module.exports = supabase;
