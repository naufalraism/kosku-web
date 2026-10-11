import { notifications } from '@mantine/notifications';
import { demoRequest } from './demo/demoApi';
import { ApiError } from './errors';
import { getMode } from './mode';

export { ApiError };

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'kosku_token';
const WAKE_NOTICE_ID = 'waking-server';

// Note: localStorage is fine for a small internal tool. For a bigger product, prefer
// httpOnly cookies, which scripts injected into the page cannot read.
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (getMode() === 'demo') return demoRequest<T>(path, options);
  return liveRequest<T>(path, options);
}

async function liveRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Free hosting sleeps when idle, so the first request can be slow. Say so instead of looking broken.
  const slowTimer = window.setTimeout(() => {
    notifications.show({
      id: WAKE_NOTICE_ID,
      loading: true,
      title: 'Waking up the server',
      message: 'The free hosting plan sleeps when idle. The first request can take up to a minute.',
      autoClose: false,
      withCloseButton: false,
    });
  }, 4000);

  try {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
    }

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
  } finally {
    window.clearTimeout(slowTimer);
    notifications.hide(WAKE_NOTICE_ID);
  }
}
