/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Accepts any incoming connection (localhost or network)
    //port: 3000, // Change to your desired port (avoid conflicts)
    hmr: {
      host: '0.0.0.0', // Match server.host for Hot Module Replacement
    },
    port: 3010, // change here
  },
  test: {
    projects: [],
  },
});
