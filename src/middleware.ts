// Szövegelek middleware — SSO redeem (PromNET → Szövegelek session-átvétel).
// Egyéb: minimal — security headers, no CSRF (még nincs state-mutating /api/*).

import { defineMiddleware } from 'astro:middleware';

interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
  };
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Cross-brand SSO redeem: ha PromNET-ről jövünk handoff-tokennel, és nincs
  // még sz_session, váltsuk be → új session + cookie + clean URL.
  const ssoToken = url.searchParams.get('_sso');
  if (ssoToken && (context.request.method === 'GET' || context.request.method === 'HEAD')) {
    try {
      const env = context.locals.runtime?.env as
        | { DB?: D1Database } | undefined;
      const db = env?.DB;
      if (db) {
        const { redeemHandoff } = await import('./lib/sso');
        const { createSession, setSessionCookie, getSessionCookie } = await import('./lib/auth');
        if (!getSessionCookie(context)) {
          const claim = await redeemHandoff(db as never, ssoToken);
          if (claim) {
            const ip = context.request.headers.get('cf-connecting-ip') ?? undefined;
            const ua = context.request.headers.get('user-agent') ?? undefined;
            const newToken = await createSession(db as never, claim.userId, ip, ua);
            setSessionCookie(context, newToken);
          }
        }
      }
    } catch (_) { /* SSO-redeem fail → user belép a hagyományos módon */ }
    url.searchParams.delete('_sso');
    const cleanUrl = url.pathname + (url.search || '');
    return new Response(null, {
      status: 302,
      headers: { Location: cleanUrl, 'Cache-Control': 'no-store' },
    });
  }

  const res = await next();
  const headers = new Headers(res.headers);
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});
