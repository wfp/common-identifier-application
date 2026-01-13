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

import type { BaseConfig } from '../../../common/types';
import type { Store } from '..';

export type ConfigSlice = {
  config: BaseConfig;
  setConfig: (data: BaseConfig["data"], isBackup: boolean) => void;
  markInitial: (isInitial: boolean) => void;
}

// Fixed Type Definition
export const createConfigSlice: StateCreator<
  Store,
  [['zustand/immer', unknown]],
  [],
  ConfigSlice
> = (set) => ({
  config: {
    isInitial: true,
    isBackup: false,
    lastUpdated: new Date(),
    // @ts-expect-error init only
    data: { meta: { id: "UNKNOWN", version: "0.0.0", signature: "" }},
  },

  setConfig: (data, isBackup) => 
    set((s) => {
      s.config.data = data;
      s.config.isBackup = isBackup;
      s.config.isInitial = false;
      s.config.lastUpdated = new Date();
    }, false),

  markInitial: (isInitial) => 
    set((s) => { 
      s.config.isInitial = isInitial; 
    }, false),
});
