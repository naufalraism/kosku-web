import { notifications } from '@mantine/notifications';
import { demoRequest } from './demo/demoApi';
import { ApiError } from './errors';
import { getMode } from './mode';

export { ApiError };

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'kosku_token';
const WAKE_NOTICE_ID = 'waking-server';

// The free host puts the API to sleep after 15 minutes without traffic, so after 10 quiet
// minutes we "wake it up" with a few health checks before sending the real request.
const WAKE_AFTER_IDLE_MS = 10 * 60 * 1000;
const WAKE_ATTEMPTS = 20;
const WAKE_DELAY_MS = 4500;

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

let lastContact = 0;
let wakePromise: Promise<void> | null = null;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (getMode() === 'demo') return demoRequest<T>(path, options);
  await ensureAwake();
  return liveRequest<T>(path, options);
}

/**
 * Polls GET /health until the API answers. If the host is asleep, the sleeping page it
 * serves can look like a failed request in the browser, so any failure here simply means
 * "not awake yet". Several requests at once share one wake-up.
 */
function ensureAwake(): Promise<void> {
  if (Date.now() - lastContact < WAKE_AFTER_IDLE_MS) return Promise.resolve();
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve();
  if (!wakePromise) {
    wakePromise = wakeUp().finally(() => {
      wakePromise = null;
    });
  }
  return wakePromise;
}

async function wakeUp(): Promise<void> {
  const noticeTimer = window.setTimeout(() => {
    notifications.show({
      id: WAKE_NOTICE_ID,
      loading: true,
      title: 'Waking up the server',
      message: 'The free hosting plan sleeps when idle. This can take up to a minute.',
      autoClose: false,
      withCloseButton: false,
    });
  }, 3000);

  try {
    for (let attempt = 0; attempt < WAKE_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(`${BASE_URL}/health`, { cache: 'no-store' });
        if (response.ok) {
          lastContact = Date.now();
          return;
        }
      } catch {
        // still asleep (or briefly unreachable): try again
      }
      await sleep(WAKE_DELAY_MS);
    }
  } finally {
    window.clearTimeout(noticeTimer);
    notifications.hide(WAKE_NOTICE_ID);
  }
}

async function liveRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    lastContact = 0;
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  // 502/503/504 come from the hosting platform (for example its "container is sleeping" page),
  // not from our API. Never show raw responses to users; say something helpful instead.
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    lastContact = 0;
    throw new ApiError(response.status, 'The server is waking up or temporarily unavailable. Please try again in a minute.');
  }

  lastContact = Date.now();

  // Expired or invalid token: clear it and tell the app to go back to the login page.
  if (response.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event('kosku:unauthorized'));
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : typeof raw === 'string' ? raw : `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}
