import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://motoristaops.henrico.works',
  build: {
    format: 'directory'
  }
});
