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
import { type Config, GpgWrapper } from '@wfp/common-identifier-algorithm-shared';
import { createWorker } from './baseWorker';

export type EncryptPayload = { config: Config.FileConfiguration, inputPath: string, outputPath: string };
export type EncryptResult = 
  | { success: true; encryptedFilePath: string }
  | { success: false; error: string; code?: string };

createWorker<EncryptPayload, EncryptResult>(async ({ config, inputPath, outputPath }) => {
  console.log("Encryption worker started for file:", inputPath);
  console.debug(`Encryption config: ${JSON.stringify(config.post_processing!.encryption)}`);
  const gpg = new GpgWrapper({
    trustAlways: true,
    binaryPathOverride: config.post_processing!.encryption!.gpgBinaryPath, // already checked exists before calling worker
    timeoutMs: 60_000,
    verifyKeys: true
  });

  const encryptResult = await gpg.encryptFile({
    inputPath,
    outputPath,
    recipient: config.post_processing!.encryption!.recipient,
    // TODO: get the signing key from the user via the UI, pass it into this function.
    // signer: options?.signer,
  });

  if (!encryptResult.success) {
    // Error is handled in the engine, returning success = false to report to renderer
    console.error(`Encryption failed: ${encryptResult.error} (code: ${encryptResult.code})`);
    return { success: false, error: encryptResult.error, code: encryptResult.code };
  }
  else {
    console.log(`Encryption succeeded, output file at: ${encryptResult.outputPath}`);
    return { success: true, encryptedFilePath: encryptResult.outputPath };
  }
});
