import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = window.SUPABASE_URL || window.__SUPABASE_URL__;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY__;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase config missing. Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY before loading the app.");
}

export const supabase = createClient(SUPABASE_URL || "https://example.supabase.co", SUPABASE_ANON_KEY || "public-anon-key");
