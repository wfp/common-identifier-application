import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: "jsdom",
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    include: [ "src/tests/**/*.{test,spec}.ts" ],
    exclude: [ "**/node_nodules/**", "**/dist/**", "**/dist-electron/**", "**/examples/**", "**/docs/**" ],
    setupFiles: [ path.resolve(__dirname, "src/tests/_vitestSetup.ts") ],
    globals: true,

    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.json"
    },
    
    coverage: {
      provider: "v8",
      include: [ "src/**/*.ts" ], // TODO: worth doing tests for the electron/common modules?
      reporter: [ "text", "json", "json-summary" ],
      reportOnFailure: true
    },

    outputFile: {
      junit: "reports/junit.xml"
    },
  }
});
