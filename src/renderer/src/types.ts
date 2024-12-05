import { SCREENS } from "./store.js";

export interface BaseConfig {
  isBackup: boolean;
  isInitial: boolean;
  lastUpdated: Date;
  data: Config.Options;
}

export interface BaseState {
  screen: SCREENS;
  config: BaseConfig;
}

export interface IBoot extends BaseState {
    screen: SCREENS.INVALID_CONFIG | SCREENS.MAIN | SCREENS. WELCOME;
    errorMessage?: string;
}

export interface ILoadConfigFinished extends BaseState {
    screen: SCREENS.CONFIG_UPDATED | SCREENS.MAIN
}

export interface ILoadConfigFailed extends BaseState {
    screen: SCREENS.INVALID_CONFIG | SCREENS.ERROR
    errorMessage: string;
    isRuntimeError: boolean;
}


export interface IValidationBegin extends BaseState {
    screen: SCREENS.FILE_LOADING;
    inputFilePath: string;
}

export interface IValidationSuccess extends BaseState {
    screen: SCREENS.VALIDATION_SUCCESS;
    document: CidDocument;
    inputFilePath: string;
    isMappingDocument: boolean;
}

export interface IValidationFailed extends BaseState {
    screen: SCREENS.VALIDATION_FAILED;
    document: CidDocument;
    inputFilePath: string;
    errorFilePath: string;
    isMappingDocument: boolean;
}

export interface IProcessingBegin extends BaseState {
    screen: SCREENS.PROCESSING_IN_PROGRESS;
    inputFilePath: string;
}

export interface IProcessingFinished extends BaseState {
    screen: SCREENS.PROCESSING_FINISHED;
    isMappingDocument: boolean;
    document: CidDocument;
    outputFilePath: string;
    mappingFilePath: string
}

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

export namespace Config {
    export interface Column {
      name: string;
      alias: string;
      default?: string | number | string[] | number[];
    }
    export interface ColumnMap {
      columns: Column[];
      postfix?: string;
    }
    export interface ColumnValidation {
      op: string;
      value?: string | number | string[] | number[];
      message?: string;
      target?: string;
    }
    export interface AlgorithmColumns {
      process: string[];
      static: string[];
      reference: string[];
    }
    export type StringBasedSalt = { source: 'STRING'; value: string };
    export type FileBasedSalt = {
      source: 'FILE';
      validator_regex?: string;
      value: {
        win32?: string;
        darwin?: string;
        linux?: string;
      };
    };
    export interface Options {
      isBackup?: boolean;
      meta: {
        region: string;
        version: string;
        signature: string;
      };
      messages?: {
        terms_and_conditions: string;
        error_in_config: string;
        error_in_salt: string;
      };
      source: ColumnMap;
      validations?: { [key: string]: ColumnValidation[] };
      algorithm: {
        columns: AlgorithmColumns;
        hash: {
          strategy: 'SHA256';
        };
        salt: StringBasedSalt | FileBasedSalt;
      };
      destination: ColumnMap;
      destination_map: ColumnMap;
      destination_errors: ColumnMap;
    }
  }
  
  export interface AppConfigData {
    termsAndConditions: { [key: string]: boolean };
    window: {
      width: number;
      height: number;
    };
  }

  export enum SUPPORTED_FILE_TYPES {
    CSV = '.csv',
    XLSX = '.xlsx',
  }
  
  export type RawData = Array<Array<any>>;
  export type MappedData = { [key: string]: any };
  

  export interface CidDocument {
    name: string;
    data: MappedData[];
  }
  