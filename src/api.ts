const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'kosku_token';

// Note: localStorage is fine for a portfolio demo. For a real product, prefer
// httpOnly cookies, which scripts injected into the page cannot read.
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Expired or invalid token: clear it and tell the app to go back to the login page.
  if (response.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event('kosku:unauthorized'));
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : raw ?? `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}
