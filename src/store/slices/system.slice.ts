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

import type { BootPayload, LoadNewConfigResult, RemoveUserConfigResult } from '../types';
import { SCREENS } from '../../../common/screens';
import type { Store } from '..';


export type SystemSlice = {
  booted: boolean;
  boot: (payload: BootPayload) => void;

  onLoadNewConfigDone: (result: LoadNewConfigResult) => void;
  onRemoveUserConfigDone: (result: RemoveUserConfigResult) => void;

  showTermsAndConditions: () => void;
  acceptTermsAndConditions: () => void;
}

export const createSystemSlice: StateCreator<
  Store,
  [['zustand/immer', unknown]],
  [],
  SystemSlice
> = (set) => ({
  booted: false,

  boot: ({ config, lastUpdated, isBackup, error, hasAcceptedTermsAndConditions }) => set(s => {
    s.config.data = config;
    s.config.lastUpdated = lastUpdated;
    if (error) {
      s.config.isBackup = false;
      s.config.isInitial = true;
      s.errorMessage = error;
      s.isRuntimeError = false;
      s.screen = SCREENS.INVALID_CONFIG;
      return;
    }

    s.config.isBackup = isBackup;
    s.config.isInitial = false;

    s.booted = true;
    s.screen = hasAcceptedTermsAndConditions ? SCREENS.MAIN : SCREENS.WELCOME;

  }, false),

  onLoadNewConfigDone: ({ success, cancelled, error, config, lastUpdated }) => set(s => {
    if (cancelled) {
      // if initial load failed previously, stay on INVALID_CONFIG screen
      s.screen = s.booted ? SCREENS.MAIN : SCREENS.INVALID_CONFIG;
      return
    }
    if (success) {
      s.config.data = config;
      s.config.isBackup = false;
      s.config.isInitial = false;
      s.config.lastUpdated = lastUpdated;
      s.screen = SCREENS.CONFIG_UPDATED;
      return;
    }
    if (!s.booted) {
      s.config.data = config;
      s.config.isBackup = false;
      s.config.isInitial = true;
      s.config.lastUpdated = lastUpdated;
      s.errorMessage = `Error in the configuration file:\n${error ?? 'Unknown Error'}`;
      s.isRuntimeError = false;
      s.screen = SCREENS.INVALID_CONFIG;
      return;
    } 
    s.errorMessage = `Error in the configuration file:\n${error ?? 'Unknown Error'}`;
    s.isRuntimeError = false;
    s.screen = SCREENS.ERROR;
  }, false),

  onRemoveUserConfigDone: ({ success, error, config, lastUpdated }) =>
    set((s) => {
      if (!success) {
        s.errorMessage = `Error in the backup configuration file:\n${error}`;
        s.isRuntimeError = false;
        s.screen = SCREENS.ERROR;
      } else {
        s.config.data = config;
        s.config.isBackup = true;
        s.config.isInitial = false;
        s.config.lastUpdated = lastUpdated;
        s.screen = SCREENS.CONFIG_UPDATED;
      }
    }, false),

  showTermsAndConditions: () => set((s) => {s.screen = SCREENS.WELCOME}, false),
  acceptTermsAndConditions: () => set((s) => {s.screen = SCREENS.MAIN}, false),
});