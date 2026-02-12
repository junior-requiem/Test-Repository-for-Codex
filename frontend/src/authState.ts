const AUTH_STORAGE_KEYS = ["supabase.auth.token", "sb-access-token", "sb-refresh-token"];

export const clearLocalAuthState = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem("supabase.auth.token");
};
