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

export const boot = async () => {
  const r = await ipc.loadSystemConfig();
  useAppStore.getState().boot(r);
}

export const quit = async () => await ipc.quit();
export const openOutputFile = async (filePath: string) => await ipc.openOutputFile(filePath);
export const revealInDirectory = async (dirPath: string) => await ipc.revealInDirectory(dirPath);
