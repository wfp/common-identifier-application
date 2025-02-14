// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import type { GetApiType } from "electron-typescript-ipc";

// TODO: actual return types for these functions
export type Api = GetApiType<
  {
    acceptTermsAndConditions: () => void;
    requestConfigUpdate: () => Promise<any>;
    loadNewConfig: () => Promise<any>;
    removeUserConfig: () => Promise<any>;
    fileDropped: (fileName: string) => Promise<void>;
    processFile: (filename: string) => Promise<void>,
    preProcessFileOpenDialog: () => Promise<void>,
    openOutputFile: (filename: string) => Promise<void>,
    quit: () => void;
  },
  {
    error: (errorMessage: string) => Promise<void>,
    configChanged: (newConfig: any) => Promise<void>
    preprocessingDone: (value: any) => Promise<void>,
    processingDone: (value: any) => Promise<void>,
    processingCancelled: () => Promise<void>;
  }
>