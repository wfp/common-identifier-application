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
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { type SystemSlice, createSystemSlice } from './slices/system.slice';
import { type ConfigSlice, createConfigSlice } from './slices/config.slice';
import { type WorkflowSlice, createWorkflowSlice } from './slices/workflow.slice';
import { type UISlice, createUISlice } from './slices/ui.slice';

export type Store = ConfigSlice & SystemSlice & WorkflowSlice & UISlice;

export const useAppStore = create<Store>()(
  immer((set, get, api) => ({
    ...createConfigSlice(set, get, api),
    ...createUISlice(set, get, api),
    ...createWorkflowSlice(set, get, api),
    ...createSystemSlice(set, get, api),
  })),
);

export const useScreen = () => useAppStore(state => state.screen);
export const useConfig = () => useAppStore(state => state.config);