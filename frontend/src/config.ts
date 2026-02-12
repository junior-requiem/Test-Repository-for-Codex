export interface FrontendConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    __SUPABASE_URL__?: string;
    __SUPABASE_ANON_KEY__?: string;
  }
}

type EnvRecord = Record<string, string | undefined>;

const readBuildTimeEnv = (): EnvRecord => {
  const meta = (import.meta as { env?: EnvRecord }).env;
  return {
    SUPABASE_URL: meta?.SUPABASE_URL ?? meta?.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: meta?.SUPABASE_ANON_KEY ?? meta?.VITE_SUPABASE_ANON_KEY,
  };
};

const readRuntimeEnv = (): EnvRecord => ({
  SUPABASE_URL: window.__APP_CONFIG__?.SUPABASE_URL ?? window.SUPABASE_URL ?? window.__SUPABASE_URL__,
  SUPABASE_ANON_KEY:
    window.__APP_CONFIG__?.SUPABASE_ANON_KEY ?? window.SUPABASE_ANON_KEY ?? window.__SUPABASE_ANON_KEY__,
});

export const getFrontendConfig = (): FrontendConfig => {
  const runtimeEnv = readRuntimeEnv();
  const buildTimeEnv = readBuildTimeEnv();
  const supabaseUrl = runtimeEnv.SUPABASE_URL ?? buildTimeEnv.SUPABASE_URL;
  const supabaseAnonKey = runtimeEnv.SUPABASE_ANON_KEY ?? buildTimeEnv.SUPABASE_ANON_KEY;

  const missing = [
    !supabaseUrl ? "SUPABASE_URL" : null,
    !supabaseAnonKey ? "SUPABASE_ANON_KEY" : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase configuration: ${missing.join(", ")}. Set build-time env vars or inject window.__APP_CONFIG__ in index.html.`,
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
};
