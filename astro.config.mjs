import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://dash-drive.henrico.works',
  build: {
    format: 'directory'
  }
});
