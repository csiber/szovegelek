import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// SSR /eszkozok/<slug> tool-page-eket manuálisan hozzáadjuk a sitemap-hez
// (Astro auto-detect csak prerendered-t tartalmaz).
const TOOL_SLUGS = [
  'termekleiras-generator',
  'facebook-hirdetes-szoveg',
  'email-marketing-szoveg',
  'instagram-poszt-generator',
  'blog-poszt-vazlat',
  'google-ads-cimsor',
  'aszf-osszefoglalo',
  'linkedin-poszt-iras',
  'sajtokozlemeny-iras',
];
const SITE = 'https://szovegelek.promnet.hu';

export default defineConfig({
  // szovegelek.hu foglalt — promnet.hu aldomainen futunk
  site: SITE,
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [
    tailwind(),
    sitemap({
      customPages: TOOL_SLUGS.map((slug) => `${SITE}/eszkozok/${slug}`),
    }),
  ],
});
