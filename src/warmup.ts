import { demoForced } from './mode';

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const MIN_GAP_MS = 5 * 60 * 1000;

let lastPing = 0;

/**
 * Quietly asks the API to wake up (the free host sleeps when idle). It never waits for or
 * reads the answer, and it is throttled, so calling it often costs almost nothing.
 */
export function prewarm() {
  if (demoForced || Date.now() - lastPing < MIN_GAP_MS) return;
  lastPing = Date.now();
  fetch(`${BASE_URL}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
}
