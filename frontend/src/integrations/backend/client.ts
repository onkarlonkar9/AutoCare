export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Request failed";
  const maybeError = (body as Record<string, unknown>).error;
  if (typeof maybeError === "string" && maybeError.trim().length > 0) return maybeError;

  if (maybeError && typeof maybeError === "object") {
    const fieldErrors = (maybeError as Record<string, unknown>).fieldErrors;
    if (fieldErrors && typeof fieldErrors === "object") {
      const firstFieldError = Object.values(fieldErrors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .find((value) => typeof value === "string");
      if (typeof firstFieldError === "string" && firstFieldError.trim().length > 0) {
        return firstFieldError;
      }
    }
  }

  return "Request failed";
}

export async function apiRequest<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(extractErrorMessage(body));
  }

  return response.json() as Promise<T>;
}
