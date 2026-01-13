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
import log from 'electron-log/renderer';

import { SCREENS } from '../../../common/screens';
import type { Store } from '..';

const logger = log.scope('renderer:store');

export type UISlice = {
  screen: SCREENS;
  errorMessage?: string;
  isRuntimeError?: boolean;

  go: (screen: SCREENS) => void;
  showError: (message: string, isRuntime?: boolean) => void;
  clearError: () => void;
}

export const createUISlice: StateCreator<
  Store,
  [['zustand/immer', unknown]],
  [],
  UISlice
> = (set) => ({
  screen: SCREENS.BOOT,
  errorMessage: undefined,
  isRuntimeError: undefined,

  go: (screen) => set(s => { s.screen = screen }, false),

  showError: (message, isRuntime = true) => set(s => {
    logger.debug(`Showing error. Runtime: ${isRuntime}, Message: ${message}`);
    s.errorMessage = message;
    s.isRuntimeError = isRuntime;
    s.screen = SCREENS.ERROR;
  }, false),

  clearError: () => set(s => {
    s.errorMessage = undefined;
    s.isRuntimeError = undefined;
  }, false),
})