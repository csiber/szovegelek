import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // szovegelek.hu foglalt — promnet.hu aldomainen futunk
  site: 'https://szovegelek.promnet.hu',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [tailwind(), sitemap()],
});
