// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import svelte from '@astrojs/svelte';

const site = process.env.SITE_URL ?? process.env.URL ?? 'https://astro-global-market-terminal.netlify.app';

export default defineConfig({
  site,
  output: 'static',
  integrations: [react(), vue(), svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
