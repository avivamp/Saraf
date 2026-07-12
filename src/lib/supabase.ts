/**
 * src/lib/supabase.ts
 *
 * Supabase singleton. The URL polyfill MUST be established before
 * @supabase/supabase-js is required. We use require() (not import) for
 * the polyfill lines so Babel's ESM hoist cannot reorder them past the
 * createClient call.
 *
 * Do NOT add any React imports here. This file is pure infrastructure.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ── URL polyfill (must be before createClient) ──────────────────────────
// setupURLPolyfill replaces Hermes's broken URL; we test it and fall back
// to a minimal hand-rolled implementation if it also fails in Snack.

class _URLSearchParams {
  private _e: [string, string][] = [];
  constructor(init = '') {
    String(init).replace(/^\?/, '').split('&').filter(Boolean).forEach((p) => {
      const i = p.indexOf('=');
      const k = i < 0 ? p : p.slice(0, i);
      const v = i < 0 ? '' : p.slice(i + 1);
      this._e.push([decodeURIComponent(k), decodeURIComponent(v)]);
    });
  }
  get(k: string) { return this._e.find(([a]) => a === k)?.[1] ?? null; }
  set(k: string, v: string) {
    const i = this._e.findIndex(([a]) => a === k);
    i >= 0 ? (this._e[i]![1] = v) : this._e.push([k, v]);
  }
  append(k: string, v: string) { this._e.push([k, v]); }
  has(k: string) { return this._e.some(([a]) => a === k); }
  toString() { return this._e.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
}

class _URL {
  protocol: string; host: string; hostname: string; port: string;
  pathname: string; search: string; hash: string; href: string;
  origin: string; username = ''; password = '';
  searchParams: _URLSearchParams;
  constructor(input: string, base?: string) {
    const str = String(base ? base + input : input);
    const m = /^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/.exec(str);
    if (!m) throw new TypeError(`Invalid URL: ${str}`);
    const [, scheme, authority, path, qs = '', frag = ''] = m;
    const [host, port = ''] = (authority ?? '').split(':');
    this.protocol = `${scheme}:`; this.host = authority ?? '';
    this.hostname = host ?? ''; this.port = port;
    this.pathname = path || '/'; this.search = qs; this.hash = frag;
    this.href = str; this.origin = `${scheme}://${authority}`;
    this.searchParams = new _URLSearchParams(qs);
  }
  toString() { return this.href; }
  toJSON()   { return this.href; }
}

function _urlWorks(): boolean {
  try {
    const u = new (globalThis as any).URL('https://example.supabase.co/auth/v1');
    return u.protocol === 'https:' && u.hostname === 'example.supabase.co';
  } catch { return false; }
}

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setupURLPolyfill } = require('react-native-url-polyfill');
    setupURLPolyfill();
  } catch { /* package not available */ }

  if (!_urlWorks()) {
    (globalThis as any).URL = _URL;
    (globalThis as any).URLSearchParams = _URLSearchParams;
  }
}

// ── Constants ───────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://ochopoveynzbqylqnapz.supabase.co';
const SUPABASE_ANON = 'sb_publishable_BgFKt-WM3AYTGic7rfYkZQ_CuF8k47q';

// ── Singleton ────────────────────────────────────────────────────────────
// Stored on global so Fast Refresh never creates a second GoTrueClient.
const _global = globalThis as typeof globalThis & { __sarafSupabase?: SupabaseClient };

if (!_global.__sarafSupabase) {
  _global.__sarafSupabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase: SupabaseClient = _global.__sarafSupabase;
