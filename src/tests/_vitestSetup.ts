/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */
import { vi } from 'vitest';

// Mock electron-log to prevent actual logging during tests
function createMockLogger() {
  const self: any = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    transports: {
      console: { level: 'debug' as const },
      ipc:     { level: false as any }, // IMPORTANT: disable IPC in tests
      file:    { level: false as any },
    },
    scope: (name: string) => self,
  };
  return self;
}

vi.mock('electron-log/renderer', () => ({ default: createMockLogger() }));
vi.mock('electron-log/main',     () => ({ default: createMockLogger() }));
vi.mock('electron-log',          () => ({ default: createMockLogger() }));

Object.defineProperty(window, "electronAPI", {
  configurable: true,
  writable: true,
  value: undefined
});

const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
}