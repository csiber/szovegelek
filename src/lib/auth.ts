// PromNET auth-rétege.
//
// PBKDF2-SHA256 jelszó-hash (Web Crypto API, CF Workers-kompatibilis).
// 100k iteráció, 16 byte salt, 32 byte hash.
// Session-token: 32 byte random hex, HTTP-only cookie.
// Session-időtartam: 30 nap.

import type { APIContext } from 'astro';

const PBKDF2_ITERATIONS = 100_000;
const SESSION_DAYS = 30;
// Szövegelek: külön session-cookie a `.navbot.hu` domainen (a PromNET `pn_session`-jétől
// függetlenül). Phase-3-finomítás: env-vary-ból olvasni; most fix.
const SESSION_COOKIE = 'sz_session';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  billing_name: string | null;
  billing_address: string | null;
  billing_zip: string | null;
  billing_city: string | null;
  billing_country: string;
  billing_tax_number: string | null;
  email_verified: number;
  created_at: number;
  updated_at: number;
  last_login_at: number | null;
  is_admin: number;
  // Demo-fiók flag — /api/auth/demo-login után ez 1.
  // AppShell banner-rel jelezzük + write-mutating endpoint-ok visszadobják 403-mal.
  is_demo: number;
  totp_enabled: number;
  avatar_path: string | null;
  investigation_hold: number;
  investigation_hold_reason: string | null;
  // Sprint 47 — "Vibe" personalization (lehet null, ha nincs override)
  custom_accent_color: string | null;
  custom_font: string | null;
  custom_dashboard_bg_path: string | null;
  custom_dashboard_bg_opacity: number | null;
  // Sprint 48 — Public profil opt-in (/u/<slug>) — 0035 migration
  public_profile_slug: string | null;
  public_profile_enabled: number;
  public_profile_bio: string | null;
  // Sprint 49 — Streak-rendszer (0033 migration)
  current_login_streak: number;
  longest_login_streak: number;
  login_streak_last_active_at: number | null;
  current_deploy_streak: number;
  longest_deploy_streak: number;
  deploy_streak_last_iso_week: string | null;
}

interface DBRow {
  [key: string]: unknown;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = DBRow>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
  all<T = DBRow>(): Promise<{ results: T[] }>;
}

// ── Crypto helpers ─────────────────────────────────────────────────

function bytesToHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

export function randomToken(byteLen = 32): string {
  const buf = new Uint8Array(byteLen);
  crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

export async function hashPassword(password: string, saltHex?: string):
  Promise<{ hash: string; salt: string }>
{
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key, 256
  );
  return { hash: bytesToHex(bits), salt: saltHex ?? bytesToHex(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string):
  Promise<boolean>
{
  const { hash: computed } = await hashPassword(password, salt);
  // Konstans-idejű összehasonlítás
  if (computed.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return diff === 0;
}

// ── User műveletek ─────────────────────────────────────────────────

export function getDB(context: APIContext): D1Database | null {
  const env = context.locals.runtime?.env as { DB?: D1Database } | undefined;
  return env?.DB ?? null;
}

export async function findUserByEmail(db: D1Database, email: string):
  Promise<(User & { password_hash: string; password_salt: string;
                    totp_secret: string | null;
                    totp_backup_codes: string | null }) | null>
{
  return db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(email.toLowerCase().trim())
    .first<User & { password_hash: string; password_salt: string;
                    totp_secret: string | null;
                    totp_backup_codes: string | null }>();
}

export async function findUserById(db: D1Database, id: string): Promise<User | null> {
  // Két-szintű SELECT: az új oszlopok (0033 streak, 0035 public profile) csak
  // a migráció után léteznek. Ha a "wide" SELECT elhasal "no such column" miatt,
  // visszaesünk a legacy SELECT-re és nullokkal töltünk. Ez lehetővé teszi a
  // deploy-t a migrations alkalmazása ELŐTT is.
  const widePromise = db.prepare(
    'SELECT id, email, display_name, billing_name, billing_address, ' +
    'billing_zip, billing_city, billing_country, billing_tax_number, ' +
    'email_verified, created_at, updated_at, last_login_at, is_admin, ' +
    'COALESCE(totp_enabled, 0) AS totp_enabled, avatar_path, ' +
    'COALESCE(investigation_hold, 0) AS investigation_hold, ' +
    'investigation_hold_reason, ' +
    'onboarding_completed_at, onboarding_dismissed_at, ' +
    'custom_accent_color, custom_font, custom_dashboard_bg_path, ' +
    'custom_dashboard_bg_opacity, ' +
    'public_profile_slug, ' +
    'COALESCE(public_profile_enabled, 0) AS public_profile_enabled, ' +
    'public_profile_bio, ' +
    'COALESCE(current_login_streak, 0) AS current_login_streak, ' +
    'COALESCE(longest_login_streak, 0) AS longest_login_streak, ' +
    'login_streak_last_active_at, ' +
    'COALESCE(current_deploy_streak, 0) AS current_deploy_streak, ' +
    'COALESCE(longest_deploy_streak, 0) AS longest_deploy_streak, ' +
    'deploy_streak_last_iso_week, ' +
    'COALESCE(is_demo, 0) AS is_demo ' +
    'FROM users WHERE id = ? LIMIT 1'
  ).bind(id).first<User>();
  try {
    return await widePromise;
  } catch (e) {
    const msg = (e as Error).message || '';
    // Ha az új oszlopok hiányoznak → fallback a legacy SELECT-re
    if (!/no such column/i.test(msg)) throw e;
    const legacy = await db.prepare(
      'SELECT id, email, display_name, billing_name, billing_address, ' +
      'billing_zip, billing_city, billing_country, billing_tax_number, ' +
      'email_verified, created_at, updated_at, last_login_at, is_admin, ' +
      'COALESCE(totp_enabled, 0) AS totp_enabled, avatar_path, ' +
      'COALESCE(investigation_hold, 0) AS investigation_hold, ' +
      'investigation_hold_reason, ' +
      'onboarding_completed_at, onboarding_dismissed_at, ' +
      'custom_accent_color, custom_font, custom_dashboard_bg_path, ' +
      'custom_dashboard_bg_opacity ' +
      'FROM users WHERE id = ? LIMIT 1'
    ).bind(id).first<Record<string, unknown>>();
    if (!legacy) return null;
    // Pótoljuk a hiányzó mezőket sane default-okkal
    const u = legacy as unknown as User;
    u.public_profile_slug = null;
    u.public_profile_enabled = 0;
    u.public_profile_bio = null;
    u.current_login_streak = 0;
    u.longest_login_streak = 0;
    u.login_streak_last_active_at = null;
    u.current_deploy_streak = 0;
    u.longest_deploy_streak = 0;
    u.deploy_streak_last_iso_week = null;
    u.is_demo = 0;
    return u;
  }
}

export async function createUser(
  db: D1Database, email: string, password: string, displayName?: string,
): Promise<User> {
  const id = `u_${randomToken(12)}`;
  const { hash, salt } = await hashPassword(password);
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(
    'INSERT INTO users (id, email, password_hash, password_salt, display_name, ' +
    'created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, email.toLowerCase().trim(), hash, salt,
    displayName ?? null, now, now
  ).run();
  return (await findUserById(db, id))!;
}

// ── Session műveletek ──────────────────────────────────────────────

export async function createSession(
  db: D1Database, userId: string, ipAddress?: string, userAgent?: string,
): Promise<string> {
  const token = randomToken(32);
  const now = Math.floor(Date.now() / 1000);
  const expires = now + SESSION_DAYS * 24 * 3600;
  await db.prepare(
    'INSERT INTO sessions (token, user_id, ip_address, user_agent, created_at, expires_at) ' +
    'VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(token, userId, ipAddress ?? null, userAgent ?? null, now, expires).run();
  await db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
    .bind(now, userId).run();
  return token;
}

export async function getSessionUser(db: D1Database, token: string): Promise<User | null> {
  const row = await db.prepare(
    'SELECT s.user_id, s.expires_at FROM sessions s WHERE s.token = ? LIMIT 1'
  ).bind(token).first<{ user_id: string; expires_at: number }>();
  if (!row) return null;
  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    await deleteSession(db, token);
    return null;
  }
  return findUserById(db, row.user_id);
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

export async function deleteAllSessionsExcept(
  db: D1Database, userId: string, keepToken: string,
): Promise<number> {
  const r = await db.prepare(
    'DELETE FROM sessions WHERE user_id = ? AND token != ?',
  ).bind(userId, keepToken).run();
  return (r.meta as { changes?: number } | undefined)?.changes ?? 0;
}

export async function listSessionsForUser(
  db: D1Database, userId: string,
): Promise<Array<{ token: string; ip_address: string | null; user_agent: string | null;
                  created_at: number; expires_at: number }>> {
  const r = await db.prepare(
    'SELECT token, ip_address, user_agent, created_at, expires_at ' +
    'FROM sessions WHERE user_id = ? ORDER BY created_at DESC',
  ).bind(userId).all<{
    token: string; ip_address: string | null; user_agent: string | null;
    created_at: number; expires_at: number;
  }>();
  return r.results;
}

// Profil-mezők frissítése (display_name + billing). Email-csere külön flow.
export async function updateProfile(
  db: D1Database, userId: string, fields: {
    display_name?: string | null;
    billing_name?: string | null;
    billing_address?: string | null;
    billing_zip?: string | null;
    billing_city?: string | null;
    billing_country?: string | null;
    billing_tax_number?: string | null;
  },
): Promise<void> {
  const cols: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    cols.push(`${k} = ?`);
    vals.push(v === '' ? null : v);
  }
  if (cols.length === 0) return;
  cols.push('updated_at = ?');
  vals.push(Math.floor(Date.now() / 1000));
  vals.push(userId);
  await db.prepare(
    `UPDATE users SET ${cols.join(', ')} WHERE id = ?`,
  ).bind(...vals).run();
}

export async function changePassword(
  db: D1Database, userId: string,
  currentPassword: string, newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await db.prepare(
    'SELECT password_hash, password_salt FROM users WHERE id = ? LIMIT 1',
  ).bind(userId).first<{ password_hash: string; password_salt: string }>();
  if (!row) return { ok: false, error: 'Felhasználó nem található.' };
  const ok = await verifyPassword(currentPassword, row.password_hash, row.password_salt);
  if (!ok) return { ok: false, error: 'A jelenlegi jelszó nem helyes.' };
  const issue = passwordIssue(newPassword);
  if (issue) return { ok: false, error: issue };
  if (currentPassword === newPassword) {
    return { ok: false, error: 'Az új jelszó térjen el a régitől.' };
  }
  const { hash, salt } = await hashPassword(newPassword);
  await db.prepare(
    'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?',
  ).bind(hash, salt, Math.floor(Date.now() / 1000), userId).run();
  return { ok: true };
}

// ── Cookie helpers ─────────────────────────────────────────────────

export function setSessionCookie(context: APIContext, token: string): void {
  context.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

export function getSessionCookie(context: APIContext): string | null {
  return context.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function clearSessionCookie(context: APIContext): void {
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
}

// ── Magas-szintű helper ────────────────────────────────────────────

export async function getCurrentUser(context: APIContext): Promise<User | null> {
  const db = getDB(context);
  if (!db) return null;
  const token = getSessionCookie(context);
  if (!token) return null;
  return getSessionUser(db, token);
}

// ── Validátorok ────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 255;
}

export function passwordIssue(password: string): string | null {
  if (password.length < 8) return 'A jelszó legalább 8 karakter legyen.';
  if (password.length > 128) return 'A jelszó max. 128 karakter lehet.';
  return null;
}

// ── Cloudflare Turnstile bot-védelem ───────────────────────────────

export async function verifyTurnstile(
  context: APIContext, token: string,
): Promise<boolean> {
  const env = context.locals.runtime?.env as
    | { TURNSTILE_SECRET?: string }
    | undefined;
  const secret = env?.TURNSTILE_SECRET ?? import.meta.env.TURNSTILE_SECRET;
  if (!secret) {
    // Ha nincs konfigurálva (dev), engedjük át — log warn
    console.warn('TURNSTILE_SECRET nincs beállítva, captcha kihagyva');
    return true;
  }
  if (!token) return false;

  try {
    const ip = context.request.headers.get('cf-connecting-ip') ?? '';
    const body = new URLSearchParams({
      secret, response: token, remoteip: ip,
    });
    const r = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    const data = await r.json() as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error('Turnstile verify hiba:', e);
    return false;
  }
}

export function getTurnstileSiteKey(context: APIContext): string {
  const env = context.locals.runtime?.env as
    | { TURNSTILE_SITE_KEY?: string }
    | undefined;
  return env?.TURNSTILE_SITE_KEY ?? import.meta.env.TURNSTILE_SITE_KEY ?? '';
}
