/// <reference types="vite-plugin-electron/electron-env" />

import type { Api } from "../common/api";

declare global {
  interface Window {
    electronAPI: Api
  }
}