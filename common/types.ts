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
import { SCREENS } from "./screens";
import type { Config, CidDocument } from "@wfp/common-identifier-algorithm-shared";
export type { Config, CidDocument } from '@wfp/common-identifier-algorithm-shared';

export type ILoadSystemConfig =
  | { status: "failed"; error: string; }
  | {
      status: "success";
      config: Config.FileConfiguration;
      isBackup: boolean;
      lastUpdated: Date;
      hasAcceptedTermsAndConditions: boolean;
    }

export type ILoadNewConfig =
  | { status: "success"; config: Config.FileConfiguration; lastUpdated: Date }
  | { status: "failed"; error: string }
  | { status: "cancelled" };

export type IRemoveConfig =
  | { status: "failed"; error: string; }
  | { status: "success"; config: Config.FileConfiguration; lastUpdated: Date; }

export type IValidationDone = {
  isValid: boolean;
  isMappingDocument: boolean;
  document: CidDocument;
  inputFilePath: string;
  errorFilePath: string;
}

export type IProcessingDone = {
  isMappingDocument: boolean;
  document: CidDocument;
  outputFilePath: string;
  mappingFilePath: string;
}

export type IEncryptionDone = {
  encryptedFilePath: string;
  error?: string;
  errorCode?: string;
}

export type MappedData = { [key: string]: any };
export interface BaseConfig {
  isBackup: boolean;
  isInitial: boolean;
  lastUpdated: Date;
  data: Config.FileConfiguration;
}

export interface ILoadConfigFailed {
    screen: SCREENS.INVALID_CONFIG | SCREENS.ERROR
    config: BaseConfig;
    errorMessage?: string;
    isRuntimeError: boolean;
}
