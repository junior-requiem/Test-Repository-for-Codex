import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = window.SUPABASE_URL || window.__SUPABASE_URL__;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY__;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase config missing. Set window.SUPABASE_URL/window.SUPABASE_ANON_KEY, provide window.__APP_CONFIG__, or use build-time env vars.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
