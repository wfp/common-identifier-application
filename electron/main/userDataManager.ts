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
import fs from 'node:fs';
import log from "electron-log/main";

import { attemptToReadTOMLData } from '@wfp/common-identifier-algorithm-shared/config';
import type { UserConfig, UserData } from '../../common/types';

const userDataLog = log.scope("userDataManager");

const APP_CONFIG_ENCODING: fs.EncodingOption = 'utf-8';

export const DEFAULT_APP_CONFIG: UserConfig = {
  // a map of <signature>:true values that stores which config's termsAndConditions were accepted
  termsAndConditions: {},
  hasUpdatedUserData: false,
  userData: {},
  window: {
    fullscreen: false,
    x: 0, y: 0,
    width: 1024, height: 800,
  },
};

export class UserDataManager {
  private config: UserConfig;
  private readonly configPath: string;

  constructor(configPath: string) {
    this.configPath = configPath;
    this.config = this.load();
  }

  getConfig = (): UserData => ({ ...this.config.userData });
  updateConfig = (partialConfig: Partial<UserData>) => {
    this.config.userData = { ...this.config.userData, ...partialConfig };
    this.config.hasUpdatedUserData = true;
    this.save();
  }
  hasUpdatedConfig = (): boolean => this.config.hasUpdatedUserData;

  getWindowBounds = (): UserConfig['window'] => ({ ...this.config.window });
  updateWindowBounds = (bounds: Partial<UserConfig['window']>) => {
    this.config.window = { ...this.config.window, ...bounds };
    this.save();
  }

  updateTermsAndConditions = (signature: string) => {
    this.config.termsAndConditions[signature] = true;
    this.save();
  }

  hasAcceptedTermsAndConditions = (signature: string): boolean => {
    return !!this.config.termsAndConditions[signature];
  }

  private load = (): UserConfig => {
    userDataLog.info(`[INFO] Loading Application config from ${this.configPath}`);
    const configData = attemptToReadTOMLData<UserConfig>(this.configPath, APP_CONFIG_ENCODING);

    if (!configData || !this.isValid(configData)) {
      userDataLog.warn('[WARN] Invalid or missing config, using defaults');
      return { ...DEFAULT_APP_CONFIG };
    }

    return configData;
  }

  private save = () => {
    try {
      const outputData = JSON.stringify(this.config, null, 4);
      fs.writeFileSync(this.configPath, outputData, APP_CONFIG_ENCODING);
      userDataLog.info(`[INFO] Written Application config data to '${this.configPath}'`);
    } catch (error) {
      userDataLog.error(`[ERROR] Failed to save config: ${error}`);
    }
  }

  private isValid = (config: any): config is UserConfig => {
    return (
      config &&
      typeof config.termsAndConditions === 'object' &&
      config.window &&
      typeof config.window.width === 'number' &&
      typeof config.window.height === 'number'
    );
  }
}