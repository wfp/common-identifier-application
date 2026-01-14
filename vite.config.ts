import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';
import { rmSync, statSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import electron from 'vite-plugin-electron/simple';
import renderer from 'vite-plugin-electron-renderer';

const SELECTED_ALGORITHM = process.env.SELECTED_ALGORITHM;
if (!SELECTED_ALGORITHM) throw new Error("No algorithm has been selected, specify the algorithm via the SELECTED_ALGORITHM env var.");

export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true });
  const isServe = command === 'serve';

  return {
    resolve: {
      alias: {
        '@': join(__dirname, 'src'),
        'common': join(__dirname, 'common'),
        '@selected-algo': `@wfp/common-identifier-algorithms/${SELECTED_ALGORITHM}`
      }
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
            resolve: {
              alias: {
                '@selected-algo': `@wfp/common-identifier-algorithms/${SELECTED_ALGORITHM}`
              }
            },
            build: {
              sourcemap: isServe ? 'inline' : false,
              minify: true,
              rollupOptions: {
                input: {
                  index: resolve('electron/main/index.ts'),
                  validateFileWorker: resolve('electron/main/ipc-handlers/workers/validateFileWorker.ts'),
                  processFileWorker: resolve('electron/main/ipc-handlers/workers/processFileWorker.ts'),
                  encryptFileWorker: resolve('electron/main/ipc-handlers/workers/encryptFileWorker.ts'),
                  // TODO: add other workers here
                },
                output: {
                  format: "cjs",
                  entryFileNames: (chunkInfo) => chunkInfo.name.endsWith("Worker") ? "workers/[name].js" : "[name].js",
                }
              }
            },
            plugins: [ copyAssetsToDistElectron() ]
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

function copyAssetsToDistElectron(): Plugin {
  const SRC_ASSETS = resolve(process.cwd(), 'assets');
  const DEST_ASSETS = resolve(process.cwd(), 'dist-electron', 'assets');
  let ranOnce = false;

  return {
    name: 'copy-assets-to-dist-electron (main)',
    apply: 'build',

    buildStart() {
      try { mkdirSync(DEST_ASSETS, { recursive: true }) } catch {}
    },

    closeBundle() {
      if (ranOnce) return;
      ranOnce = true;

      try {
        const st = statSync(SRC_ASSETS);
        if (!st.isDirectory()) return; // no assets dir; skip
      } catch (err: any) {
        if (err?.code === 'ENOENT') return; // missing assets dir; skip
        console.warn('[copy-assets-to-dist-electron] warning:', err?.message);
        return;
      }

      mkdirSync(DEST_ASSETS, { recursive: true });
      cpSync(SRC_ASSETS, DEST_ASSETS, {recursive: true});
      console.log(`[copy-assets-to-dist-electron] Copied assets -> ${DEST_ASSETS}`);
      console.log(`[copy-assets-to-dist-electron] Assets directory contains: ${readdirSync(DEST_ASSETS)}`);
    },
  };
}
