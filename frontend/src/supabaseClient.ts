import { createClient } from "@supabase/supabase-js";
import { getFrontendConfig } from "./config";

const { supabaseUrl, supabaseAnonKey } = getFrontendConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
