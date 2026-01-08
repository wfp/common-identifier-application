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
import type { ILoadNewConfig, IRemoveUserConfig, IRequestConfigUpdate } from "./types";

// TODO: actual return types for these functions
export type Api = GetApiType<
  {
    getFilePath: (file: File) => string;
    getPosixFilePath: (file: File) => string;

    requestConfigUpdate: () => Promise<IRequestConfigUpdate>;
    loadNewConfig: () => Promise<ILoadNewConfig>;
    removeUserConfig: () => Promise<IRemoveUserConfig>;

    acceptTermsAndConditions: () => void;
    fileDropped: (filePath: string) => void;
    processFile: (filePath: string) => void,
    preProcessFileOpenDialog: () => void,
    openOutputFile: (filePath: string) => void,
    
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