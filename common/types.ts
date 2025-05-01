import { SCREENS } from "./screens";
import type { Config, CidDocument } from "common-identifier-algorithm-shared";
export type { Config, CidDocument } from 'common-identifier-algorithm-shared';

export type IRequestConfigUpdate = {
  config: Config.FileConfiguration;
  isBackup: boolean;
  lastUpdated: Date;
  error: string | undefined;
  hasAcceptedTermsAndConditions: boolean;
}

export type ILoadNewConfig = {
  success: boolean;
  cancelled: boolean;
  config: Config.FileConfiguration;
  lastUpdated: Date;
  error?: string;
}

export type IRemoveUserConfig = {
  success: boolean;
  config: Config.FileConfiguration;
  lastUpdated: Date;
  error?: string;
}

export type IPreProcessingDone = {
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

export type MappedData = { [key: string]: any };
export interface BaseConfig {
  isBackup: boolean;
  isInitial: boolean;
  lastUpdated: Date;
  data: Config.FileConfiguration;
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
    errorMessage?: string;
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