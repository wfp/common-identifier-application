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
import { useAppStore } from '..';
import * as ipc from '../../ipc/intercom-bridge';
import { SCREENS } from '../../../common/screens';

export const acceptTermsAndConditions = async () => {
  await ipc.acceptTermsAndConditions();
  useAppStore.getState().acceptTermsAndConditions();
}

export const loadNewConfig = async () => {
  useAppStore.getState().go(SCREENS.LOAD_NEW_CONFIG);
  const r = await ipc.loadNewConfig();
  useAppStore.getState().onLoadNewConfigDone(r);
};

export const removeConfig = async () => {
  useAppStore.getState().go(SCREENS.LOAD_NEW_CONFIG);
  const r = await ipc.removeConfig();
  useAppStore.getState().onRemoveConfigDone(r);
};
