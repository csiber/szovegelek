import type { APIContext } from 'astro';
import { getDB, getSessionCookie, deleteSession, clearSessionCookie } from '../../../lib/auth';

export const prerender = false;

async function performLogout(context: APIContext): Promise<void> {
  const db = getDB(context);
  const token = getSessionCookie(context);
  if (db && token) await deleteSession(db, token);
  clearSessionCookie(context);
}

export async function POST(context: APIContext): Promise<Response> {
  await performLogout(context);
  const accept = (context.request.headers.get('accept') ?? '').toLowerCase();
  if (accept.includes('application/json') && !accept.includes('text/html')) {
    return new Response(JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(null, {
    status: 303,
    headers: { Location: '/?logged_out=1', 'Cache-Control': 'no-store' },
  });
}

export async function GET(context: APIContext): Promise<Response> {
  await performLogout(context);
  return new Response(null, {
    status: 302,
    headers: { Location: '/?logged_out=1', 'Cache-Control': 'no-store' },
  });
}
