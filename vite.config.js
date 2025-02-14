import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import electron from 'vite-plugin-electron/simple';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';

export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true });
  const isServe = command === 'serve';
  const isBuild = command === 'build';

  return {
    resolve: {
      '@': join(__dirname, 'src'),
      common: join(__dirname, 'common')
    },
    optimizeDeps: {
      exclude: [ 'node_modules/.vite/deps' ]
    },
    plugins: [
      react(),
      electron({
        main: {
          entry: 'electron/main/index.ts',
          vite: {
            build: {
              sourcemap: isServe ? 'inline' : false,
              minify: true,
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {},
                ),
              },
            }
          }
        },
        preload: {
          input: 'electron/preload.mts',
        },
      }),
      renderer()
    ],
  };
});
