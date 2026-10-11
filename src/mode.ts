/**
 * The app runs in one of two modes:
 *  - "live": talks to the real API (the owner signs in with a real account)
 *  - "demo": runs on sample data kept in the browser (anyone can try it)
 *
 * VITE_DEMO=true forces demo mode everywhere (handy for local work without a backend).
 * Otherwise the visitor picks a mode on the login page, and the choice lasts for the browser tab.
 */
export type Mode = 'live' | 'demo';

const MODE_KEY = 'kosku_mode';

export const demoForced: boolean = import.meta.env.VITE_DEMO === 'true';

let memoryMode: Mode | null = null;

export function getMode(): Mode {
  if (demoForced) return 'demo';
  if (memoryMode) return memoryMode;
  try {
    return sessionStorage.getItem(MODE_KEY) === 'demo' ? 'demo' : 'live';
  } catch {
    return 'live';
  }
}

export function setMode(mode: Mode) {
  memoryMode = mode;
  try {
    sessionStorage.setItem(MODE_KEY, mode);
  } catch {
    // storage unavailable: the choice then only lasts until the page is reloaded
  }
}

export function clearMode() {
  memoryMode = null;
  try {
    sessionStorage.removeItem(MODE_KEY);
  } catch {
    // ignore
  }
}
