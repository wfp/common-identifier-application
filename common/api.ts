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

import type { GetApiType } from "electron-typescript-ipc";
import type { IEncryptionDone, ILoadNewConfig, IValidationDone, IProcessingDone, IRemoveConfig, ILoadSystemConfig } from "./types";
import type { EVENT } from "./events";

// TODO: actual return types for these functions
export type Api = GetApiType<
  {
    loadSystemConfig: () => Promise<ILoadSystemConfig>; // load config from system
    loadNewConfig: () => Promise<ILoadNewConfig>;       // open dialogue to load new config
    removeConfig: () => Promise<IRemoveConfig>;         // remove user config, revert to default (backup)

    acceptTermsAndConditions: () => void;

    getFilePath: (file: File) => string | undefined;
    getPosixFilePath: (file: File) => string | undefined;

    validateFileDropped: (filePath: string) => void;
    validateFileOpenDialogue: () => void,

    processFile: (filePath: string) => void,

    openOutputFile: (filePath: string) => void;
    revealInDirectory: (filePath: string) => void;

    encryptFile: (filePath: string) => void;

    reset: () => void;
    unsubscribe: (event: EVENT, handler: (...args: any[]) => void) => void;
    quit: () => void;
  },
  {
    error: (errorMessage: string) => Promise<void>,
    validationDone: (value: IValidationDone) => Promise<void>,
    processingDone: (value: IProcessingDone) => Promise<void>,
    processingCancelled: () => Promise<void>;
    encryptionDone: (value: IEncryptionDone) => Promise<void>;
  }
>