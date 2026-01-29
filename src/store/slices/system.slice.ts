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
import type { StateCreator } from 'zustand';

import type { ILoadSystemConfig, ILoadNewConfig, IRemoveConfig, UserData } from '../../../common/types';
import { SCREENS } from '../../../common/screens';
import type { Store } from '..';


export type SystemSlice = {
  booted: boolean;
  userData?: UserData;
  hasAcceptedTermsAndConditions: boolean;
  hasUpdatedUserData: boolean;

  boot: (payload: ILoadSystemConfig) => void;

  onLoadNewConfigDone: (result: ILoadNewConfig) => void;
  onRemoveConfigDone: (result: IRemoveConfig) => void;

  showTermsAndConditions: () => void;
  acceptTermsAndConditions: () => void;

  onSetUserData: (userData: UserData) => void;
}

export const createSystemSlice: StateCreator<
  Store,
  [['zustand/immer', unknown]],
  [],
  SystemSlice
> = (set) => ({
  booted: false,
  userData: {},
  hasAcceptedTermsAndConditions: false,
  hasUpdatedUserData: false,

  boot: (result) => set(s => {
    if (result.status === "failed") {
      s.errorMessage = result.error;
      s.isRuntimeError = false;
      s.screen = SCREENS.INVALID_CONFIG;
      return;
    }
    const { config, isBackup, lastUpdated, hasAcceptedTermsAndConditions, hasUpdatedUserData, userData } = result;
    s.config.data = config;
    s.config.lastUpdated = lastUpdated;

    s.config.isBackup = isBackup;
    s.config.isInitial = false;

    s.booted = true;
    s.userData = userData;
    const encryptionEnabled = !!s.config.data.post_processing?.encryption;
    s.screen = !hasAcceptedTermsAndConditions ? SCREENS.WELCOME : encryptionEnabled && !hasUpdatedUserData ? SCREENS.INPUT_USER_DATA : SCREENS.MAIN;

  }, false),

  onLoadNewConfigDone: (result) => set(s => {
    if (result.status === "cancelled") {
      // if initial load failed previously, stay on INVALID_CONFIG screen
      s.screen = s.booted ? SCREENS.MAIN : SCREENS.INVALID_CONFIG;
      return
    }

    if (result.status === "success") {
      s.config.data = result.config;
      s.config.isBackup = false;
      s.config.isInitial = false;
      s.config.lastUpdated = result.lastUpdated;
      s.screen = SCREENS.CONFIG_UPDATED;
      return;
    }

    if (result.status === "failed") {
      // report error, stay on current config, route to error screen
      s.errorMessage = `Error loading new configuration file:\n${result.error}`;
      s.isRuntimeError = false;
      s.screen = s.booted ? SCREENS.ERROR : SCREENS.INVALID_CONFIG;
      return;
    }
  }, false),

  onRemoveConfigDone: (result) => set((s) => {
    if (result.status === "failed") {
      s.errorMessage = `Error removing user configuration:\n${result.error}`;
      s.isRuntimeError = false;
      s.screen = SCREENS.ERROR;
      return;
    }
    else {
      s.config.data = result.config;
      s.config.isBackup = true;
      s.config.isInitial = false;
      s.config.lastUpdated = result.lastUpdated;
      s.screen = SCREENS.CONFIG_UPDATED;
    }
  }, false),

  showTermsAndConditions: () => set((s) => {s.screen = SCREENS.WELCOME}, false),
  acceptTermsAndConditions: () => set((s) => {
    // if config has encryption options and user app data does not contain signing keys,
    // go to input user data screen, otherwise go to main.
    const encryptionEnabled = !!s.config.data.post_processing?.encryption;
    s.screen = encryptionEnabled && !s.hasUpdatedUserData ? SCREENS.INPUT_USER_DATA : SCREENS.MAIN;    
  }, false),

  onSetUserData: (userData) => set((s) => {
    s.userData = userData;
    s.screen = SCREENS.MAIN;
  }, false),
});