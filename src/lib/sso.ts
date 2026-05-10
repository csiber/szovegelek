// Cross-brand SSO handoff — PromNET ↔ NavBot session-átvétel.
//
// Mindkét brand ugyanazon a D1-on, ugyanazon a `users` táblán él. A
// cookie-domain ('.promnet.hu' vs '.navbot.hu') szétválasztja a session-t,
// így ha a user PromNET-en be van lépve és NavBot-ra navigál (vagy fordítva),
// alapesetben újra be kell lépnie. A SSO handoff áthidalja:
//
// 1. Forrás-brand middleware-e: a redirect ELŐTT issueHandoff() — egy
//    rövid életű (60s), egyszer-felhasználható token-t generál. Append a
//    cél-URL-hez `?_sso=<token>`.
// 2. Cél-brand middleware-e: ha lát `?_sso=`, redeemHandoff() — kiveszi a
//    user_id-t, létrehoz egy NavBot/PromNET session-t (új sessions-row),
//    setSessionCookie a brand-specifikus cookie-val, redirect ugyanoda
//    `?_sso` nélkül.
//
// Biztonsági megfontolások:
//   - Token 32-byte randomToken, 60s TTL, single-use (used_at)
//   - URL-paraméter rövid távon publikusan visible, de single-use → reuse
//     blokkolt; a böngésző a `_sso`-t azonnal eltávolítja a redirect-ben
//   - Cache-Control: no-store mindkét oldalon

interface D1 {
  prepare(query: string): {
    bind(...v: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
  };
}

const HANDOFF_TTL_SECONDS = 60;

/** 32-byte random hex token. */
function randomToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Új SSO handoff-token generálása. A forrás-brand middleware-je hívja
 *  REDIRECT ELŐTT, ha a user be van lépve. */
export async function issueHandoff(
  db: D1,
  userId: string,
  source: 'promnet' | 'navbot',
): Promise<string> {
  const token = randomToken();
  const now = Math.floor(Date.now() / 1000);
  const expires = now + HANDOFF_TTL_SECONDS;
  await db.prepare(
    'INSERT INTO sso_handoff_tokens (token, user_id, source, created_at, expires_at, used_at) ' +
    'VALUES (?, ?, ?, ?, ?, NULL)',
  ).bind(token, userId, source, now, expires).run();
  return token;
}

/** Token beváltása. Single-use atomic update: csak akkor adja vissza a
 *  user_id-t ha még nem volt használva ÉS nem járt le. */
export async function redeemHandoff(
  db: D1,
  token: string,
): Promise<{ userId: string; source: string } | null> {
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const now = Math.floor(Date.now() / 1000);
  // Atomic: UPDATE ... WHERE used_at IS NULL — ha 0 row változott, már
  // használták (vagy lejárt vagy nem létezik).
  const upd = await db.prepare(
    'UPDATE sso_handoff_tokens SET used_at = ? ' +
    'WHERE token = ? AND used_at IS NULL AND expires_at > ?',
  ).bind(now, token, now).run();
  const changes = (upd.meta?.changes ?? 0);
  if (changes < 1) return null;
  // Most már single-use: kiolvassuk a user_id-t
  const row = await db.prepare(
    'SELECT user_id, source FROM sso_handoff_tokens WHERE token = ?',
  ).bind(token).first<{ user_id: string; source: string }>();
  if (!row) return null;
  return { userId: row.user_id, source: row.source };
}

/** Régi tokenek garbage-collection (cron-ról vagy ad-hoc). */
export async function cleanupExpiredHandoffs(db: D1): Promise<number> {
  const cutoff = Math.floor(Date.now() / 1000) - 3600; // 1h cutoff
  const r = await db.prepare(
    'DELETE FROM sso_handoff_tokens WHERE expires_at < ?',
  ).bind(cutoff).run();
  return r.meta?.changes ?? 0;
}

/** A redirect-URL-hez append-eli a handoff-tokent `?_sso=` query-paramként. */
export function appendHandoffParam(url: string, token: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_sso=${encodeURIComponent(token)}`;
}

/** A cél-URL-ből eltávolítja az `?_sso=` paramot (a redirect után). */
export function stripHandoffParam(url: URL): string {
  url.searchParams.delete('_sso');
  return url.pathname + (url.search || '') + url.hash;
}
