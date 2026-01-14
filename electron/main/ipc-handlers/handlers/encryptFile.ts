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
import type { Config, ConfigStore } from '@wfp/common-identifier-algorithm-shared';
import { type BrowserWindow } from 'electron';
import log from "electron-log/main";
import path from 'node:path';

import type { WorkerManager } from '../workers';
import { EVENT } from '../../../../common/events';
import type { EncryptPayload, EncryptResult } from '../workers/encryptFileWorker';

const ipcLog = log.scope("ipc:encryptFile");

type WM = WorkerManager<EncryptPayload, EncryptResult>

// Encrypts the specified file
export async function encryptFile(win: BrowserWindow, manager: WM, configStore: ConfigStore, filePath: string): Promise<void> {
  ipcLog.info('Attempting to encrypt file:', filePath);

  const config = configStore.getConfig() as Config.FileConfiguration;

  if (!config.post_processing || !config.post_processing.encryption) {
    ipcLog.warn('Encryption postprocessing step not configured, skipping encryption.');
    // TODO: send this or present an error? Or send nothing? This branch is checked before caling this anyway, does it matter?
    win.webContents.send(EVENT.ENCRYPTION_FINISHED, { encryptedFilePath: null, error: "GPG Encryption is not enabled on this system." });
    return;
  }
  
  const outputPath = path.join(path.dirname(filePath), `ENCRYPTED-${path.basename(filePath)}.gpg`);

  manager.spawn({ config, inputPath: filePath, outputPath }, (message) => {
    if (message.status === "cancelled") {
      ipcLog.info('Encryption worker reported cancellation.');
      return; // NO-OP: renderer process already informed of cancellation
    }

    if (message.status === "success") {
      // NOTE: this api is a bit clunky but fine, payload.success indicates encryption success.
      //       if success = false, an error occurred during encryption, but was handled gracefully,
      //       so it is not a runtime error - only report it to renderer.
      if (!message.payload.success) {
        ipcLog.info(`Encryption failed: ${message.payload.error} (code: ${message.payload.code})`);
        win.webContents.send(EVENT.ENCRYPTION_FINISHED, {
          encryptedFilePath: null,
          error: message.payload.error,
          errorCode: message.payload.code
        });
      }
      else {
        ipcLog.info(`Encryption succeeded, output file at: ${message.payload.encryptedFilePath}`);
        win.webContents.send(EVENT.ENCRYPTION_FINISHED, message.payload);
      }
    }
    else {
      ipcLog.error(`Encryption failed with runtime error: ${message.error}`);
      win.webContents.send(EVENT.ERROR, `File encryption failed: ${message.error}`);
    }
  });
}
