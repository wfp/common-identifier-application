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

import { type ConfigStore, GpgWrapper } from '@wfp/common-identifier-algorithm-shared';
import log from "electron-log/main";

import type { BrowserWindow } from 'electron';
import { EVENT } from '../../../common/events';
import path from 'node:path';

const ipcLog = log.scope("ipc:encryptFile"); 

// Encrypts the specified file
export async function encryptFile(win: BrowserWindow, configStore: ConfigStore, filePath: string): Promise<void> {
  ipcLog.info('Attempting to encrypt file:', filePath);

  const config = configStore.getConfig(); 
  if (!config) throw new Error("No configuration available for encryption");

  if (!config.post_processing || !config.post_processing.encryption) {
    ipcLog.warn('Encryption postprocessing step not configured, skipping encryption.');
    // TODO: send this or present an error? Or send nothing? This branch is checked before caling this anyway, does it matter?
    win.webContents.send(EVENT.ENCRYPTION_FINISHED, { encryptedFilePath: null, error: "GPG Encryption is not enabled on this system." });
    return;
  }

  ipcLog.debug(`Encryption config: ${JSON.stringify(config.post_processing.encryption)}`);
  const gpg = new GpgWrapper({
    trustAlways: true,
    binaryPathOverride: config.post_processing.encryption.gpgBinaryPath,
    timeoutMs: 60_000,
    verifyKeys: true
  });

  const encryptResult = await gpg.encryptFile({
    inputPath: filePath,
    outputPath: path.join(path.dirname(filePath), `ENCRYPTED-${path.basename(filePath)}.gpg`),
    recipient: config.post_processing.encryption.recipient,
    // TODO: get the signing key from the user via the UI, pass it into this function.
    // signer: options?.signer,
  });

  if (!encryptResult.success) {
    ipcLog.error(`Encryption failed: ${encryptResult.error} (code: ${encryptResult.code})`);
    win.webContents.send(EVENT.ENCRYPTION_FINISHED, { encryptedFilePath: null, error: encryptResult.error, errorCode: encryptResult.code });
  }
  else {
    ipcLog.info(`Encryption succeeded, output file at: ${encryptResult.outputPath}`);
    win.webContents.send(EVENT.ENCRYPTION_FINISHED, { encryptedFilePath: encryptResult.outputPath });
  }
}
