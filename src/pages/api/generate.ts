// POST /api/generate — magyar copy-generálás Workers AI Llama-3.3-mal.
// Body: { template, topic, tone, audience? }
// Visszatérés: { ok, versions: [str, str, str], quota_remaining? }
//
// Anonim IP-quota: 20 / hó / IP. Magasabb cap regisztrált usereknek
// (közös D1 — szovegelek_anon_quota tábla a hónapos counter-hez).

import type { APIContext } from 'astro';

interface AIBinding {
  run(model: string, params: { messages?: Array<{ role: string; content: string }>; max_tokens?: number; temperature?: number }): Promise<{ response?: string }>;
}
interface D1 {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

interface RuntimeEnv { AI?: AIBinding; DB?: D1 }

export const prerender = false;

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const FREE_QUOTA_PER_MONTH = 20;

const TEMPLATE_PROMPTS: Record<string, string> = {
  product:   `Te magyar copywriter vagy magyar webshopnak. Generálj 3 darab termékleírás-verziót: 1) RÖVID (40-60 szó, hooks az érzelemre), 2) KÖZEPES (80-120 szó, value-prop + USP), 3) HOSSZÚ (150-200 szó, storytelling). Magyar nyelven, természetes mondatokkal, NEM ChatGPT-stílus. Kerüld a "fedezze fel", "izgalmas utazás" típusú giccses sablon-szövegeket. Kerüld az AI-frázisokat. Output: EXACTLY 3 verzió "---" elválasztással, semmi más szöveg.`,
  fb_ad:     `Te magyar Facebook-hirdetés-szakértő vagy. Generálj 3 hirdetés-verziót, mindegyik 3-4 sor: hook (figyelem) → value (konkrét haszon) → CTA (világos lépés). Beszélj közvetlen "te"-formában a célcsoporthoz. Magyar nyelven, természetes módon. Output: 3 verzió "---" elválasztással.`,
  email:     `Te magyar e-mail-marketing szakértő vagy. Generálj 3 e-mail-verziót, mindegyik strukturáltan: TÁRGY: ... (max 50 char) | BEVEZETŐ: 1-2 mondat | TÖRZS: 3-5 mondat value-vel | ZÁRÁS: CTA + udvarias búcsú. Magyar nyelven. Output: 3 verzió "---" elválasztással.`,
  instagram: `Te magyar IG-content-creator vagy KKV-knek. Generálj 3 caption-verziót: 1) RÖVID-hookos (max 100 szó), 2) STORYTELLING (150-200 szó), 3) LISTA-stílus (4-5 pont). Mindegyik végén 5-7 magyar/angol hashtag a témához. Magyar nyelven. Output: 3 verzió "---" elválasztással.`,
  blog:      `Te magyar blog-író vagy KKV-tartalomhoz. Generálj 3 blog-poszt-vázlat-verziót: CÍM (kattintható) | LEAD (1 bekezdés, 2-3 mondat) | 4 SZEKCIÓ-CÍM + minegyikhez 1-1 mondat összefoglaló | ZÁRÓ-CTA. Magyar nyelven. Output: 3 verzió "---" elválasztással.`,
  gads:      `Te magyar Google Ads szakértő vagy. Generálj 3 hirdetés-verziót, mindegyik tartalmazzon: 3 db CÍMSOR (max 30 char EACH) + 2 db LEÍRÁS (max 90 char EACH). Magyar nyelven, kulcsszó-rich. Output: 3 verzió "---" elválasztással.`,
  aszf:      `Te magyar jogi-content-writer vagy KKV-knek. Egy bonyolult ÁSZF-szövegből / -témából írj 3 közérthető-summary-verziót: 1) ULTRA-RÖVID (3 mondat, max 200 char), 2) KÖZEPES (5-6 mondat, kulcs-pontok), 3) HOSSZÚ (8-10 mondat, részletesebb, de még közérthető). NE jogi-szakszót használj, hanem hétköznapit. Output: 3 verzió "---" elválasztással.`,
  linkedin:  `Te magyar LinkedIn-content-creator vagy. Generálj 3 poszt-verziót: 1) STORYTELLING (személyes anekdota → tanulság, 800-1000 char), 2) INSIGHT (5-pontos lista insight-ekkel, 600-800 char), 3) KÉRDÉS-ENGAGEMENT (provokatív kérdés + saját álláspont, 400-600 char). Pro-tone, de természetes. Magyar nyelven. Output: 3 verzió "---" elválasztással.`,
  press:     `Te magyar PR / sajtóközlemény szakértő vagy. Generálj 3 sajtóközlemény-verziót, mindegyik: CÍM (informatív, 8-12 szó) | LEAD (1 bekezdés, 5W: ki, mit, mikor, hol, miért) | 3 BEKEZDÉS (idézet a cégvezetőtől, kontextus, jövő). Magyar média-style, semleges-objektív hang. Output: 3 verzió "---" elválasztással.`,
};

const TONE_HINT: Record<string, string> = {
  friendly: 'Hangulat: barátságos, közvetlen "te"-forma.',
  professional: 'Hangulat: szakmai, komoly, "ön"-forma.',
  playful: 'Hangulat: játékos, humoros, kreatív szóviccek.',
  luxury: 'Hangulat: prémium, exkluzív, lassú elegáns mondatok.',
  urgent: 'Hangulat: sürgős, akciós, hatékony rövid mondatok, határidő-pressure.',
};

interface Body {
  template?: unknown;
  topic?: unknown;
  tone?: unknown;
  audience?: unknown;
}

export async function POST(context: APIContext): Promise<Response> {
  const env = (context.locals as { runtime?: { env: RuntimeEnv } }).runtime?.env ?? {};
  if (!env.AI) return jerr(500, 'AI binding nincs.');

  let body: Body;
  try { body = await context.request.json() as Body; }
  catch { return jerr(400, 'Hibás JSON.'); }

  const template = String(body.template ?? '').toLowerCase();
  const topic = String(body.topic ?? '').trim();
  const tone = String(body.tone ?? 'friendly');
  const audience = String(body.audience ?? '').trim();

  if (!TEMPLATE_PROMPTS[template]) return jerr(400, 'Ismeretlen sablon.');
  if (topic.length < 5) return jerr(400, 'A téma túl rövid (min 5 char).');
  if (topic.length > 500) return jerr(400, 'A téma túl hosszú (max 500 char).');

  // IP-alapú anonim-quota
  const ip = context.request.headers.get('cf-connecting-ip')
          ?? context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? 'unknown';
  const monthKey = (() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  })();

  let quotaRemaining: number | undefined;
  if (env.DB) {
    try {
      const row = await env.DB.prepare(
        'SELECT used FROM szovegelek_anon_quota WHERE ip = ? AND month_key = ?',
      ).bind(ip, monthKey).first<{ used: number }>();
      const used = row?.used ?? 0;
      if (used >= FREE_QUOTA_PER_MONTH) {
        return jerr(429, `Havi 20 ingyen generálás elfogyott erről az IP-ről. Regisztrálj +30-ért, vagy várd a hónap végét.`);
      }
      quotaRemaining = FREE_QUOTA_PER_MONTH - used - 1;
    } catch {
      // tábla még nem létezik → folytatjuk fallback-kel (no-quota)
    }
  }

  // Prompt-build
  const systemPrompt = TEMPLATE_PROMPTS[template] + ' ' + (TONE_HINT[tone] ?? '');
  const userPrompt = `TÉMA: ${topic}` + (audience ? `\n\nCÉLCSOPORT: ${audience}` : '');

  let aiOut = '';
  try {
    const r = await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.85,
    });
    aiOut = r?.response ?? '';
  } catch (e) {
    return jerr(500, `AI-hiba: ${(e as Error).message}`);
  }

  // Verziók szétbontása "---" alapján
  let versions = aiOut.split(/\n*-{3,}\n*/).map((s) => s.trim()).filter((s) => s.length > 10);
  if (versions.length < 3) {
    // Fallback: szét-bontás üres-sor-2-szerese alapján, vagy 1-verzió output
    const alt = aiOut.split(/\n\n+/).map((s) => s.trim()).filter((s) => s.length > 30);
    if (alt.length >= 3) versions = alt.slice(0, 3);
    else versions = [aiOut.trim()];
  }
  versions = versions.slice(0, 3);

  // Counter increment (best-effort)
  if (env.DB && quotaRemaining !== undefined) {
    try {
      await env.DB.prepare(
        'INSERT INTO szovegelek_anon_quota (ip, month_key, used) VALUES (?, ?, 1) ' +
        'ON CONFLICT (ip, month_key) DO UPDATE SET used = used + 1',
      ).bind(ip, monthKey).run();
    } catch { /* skip */ }
  }

  return new Response(JSON.stringify({
    ok: true,
    versions,
    quota_remaining: quotaRemaining,
  }), { headers: { 'Content-Type': 'application/json' } });
}

function jerr(status: number, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }),
    { status, headers: { 'Content-Type': 'application/json' } });
}
