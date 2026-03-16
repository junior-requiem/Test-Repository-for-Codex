import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const runtimeConfig = window.__APP_CONFIG__ ?? {};
const SUPABASE_URL = runtimeConfig.SUPABASE_URL || window.SUPABASE_URL || window.__SUPABASE_URL__;
const SUPABASE_ANON_KEY = runtimeConfig.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY__;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY via build-time env vars or window.__APP_CONFIG__.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
