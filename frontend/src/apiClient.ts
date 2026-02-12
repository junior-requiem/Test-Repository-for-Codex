import { clearLocalAuthState } from "./authState";
import { supabase } from "./supabaseClient";

const parseErrorBody = async (response: Response): Promise<string | undefined> => {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = await response.json();
      if (typeof body?.message === "string") return body.message;
      if (typeof body?.error === "string") return body.error;
    }

    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
};

const toActionableError = async (response: Response): Promise<Error> => {
  const detail = await parseErrorBody(response);

  if (response.status === 401) {
    return new Error(detail || "Your session has expired or credentials are invalid. Please log in again.");
  }

  if (response.status >= 500) {
    return new Error(detail || "The server is unavailable right now. Please try again in a moment.");
  }

  if (response.status >= 400) {
    return new Error(detail || "The request was rejected. Please verify your input and try again.");
  }

  return new Error("Unexpected API error.");
};

const getAccessToken = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Unable to retrieve your session. Please sign in again. (${error.message})`);
  }

  return data.session?.access_token ?? null;
};

export const apiFetch = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  let token: string | null = null;

  try {
    token = await getAccessToken();
  } catch (error) {
    clearLocalAuthState();
    window.location.assign("/login");
    throw error;
  }

  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      clearLocalAuthState();
      window.location.assign("/login");
      throw await toActionableError(response);
    }

    if (!response.ok) {
      throw await toActionableError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Network error: unable to reach the server. Check your internet connection and retry.");
    }

    throw error;
  }
};
