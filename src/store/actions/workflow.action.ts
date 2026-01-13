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
import { useAppStore } from '..'
import * as ipc from '../../ipc/intercom-bridge';

export const startValidation = async (filePath?: string) => {
  useAppStore.getState().startValidation(filePath);
  if (filePath) await ipc.validateFileDropped(filePath);
  else await ipc.validateFileOpenDialogue();
};

export const startProcessing = async (filePath: string) => {
  useAppStore.getState().startProcessing(filePath);
  await ipc.processFile(filePath);
};

export const startEncryption = async (filePath: string) => {
  useAppStore.getState().startEncryption(filePath);
  await ipc.encryptFile(filePath);
};
