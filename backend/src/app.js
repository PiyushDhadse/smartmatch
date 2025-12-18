const express = require("express");
const cors = require("cors");
const supabase = require("../config/supabase");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Simple health check
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "smartmatch-backend", status: "up" });
});

// Supabase env/connection check
app.get("/health/supabase", async (req, res) => {
  try {
    // Basic check: ensure keys are present
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // OPTIONAL: uncomment this block when you are sure you have a valid service role key
    // to perform an actual request against Supabase. This will fail if the key/URL are wrong.
    //
    // const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    // if (error) throw error;

    return res.json({
      ok: hasUrl && (hasAnonKey || hasServiceRoleKey),
      hasUrl,
      hasAnonKey,
      hasServiceRoleKey,
      // supabaseReachable: !error, // when using the admin call above
    });
  } catch (err) {
    console.error("Supabase health check failed:", err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

module.exports = app;
