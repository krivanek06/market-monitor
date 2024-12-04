import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikNxVite } from 'qwik-nx/plugins';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/apps/website',
  ssr: { target: 'webworker', noExternal: true },
  plugins: [
    qwikNxVite(),
    qwikCity({
      routesDir: 'apps/website/src/routes',
    }),
    qwikVite({
      srcDir: 'apps/website/src',
      client: {
        outDir: '../../dist/apps/website',
      },
      ssr: {
        outDir: '../../dist/apps/website/server',
      },
      tsconfigFileNames: ['tsconfig.app.json'],
    }),
    tsconfigPaths({ root: '../../' }),
  ],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['../../'],
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
});
