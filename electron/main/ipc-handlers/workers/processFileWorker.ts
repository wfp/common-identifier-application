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
import { processFile, SUPPORTED_FILE_TYPES} from '@wfp/common-identifier-algorithm-shared';
import type { CidDocument, Config } from '@wfp/common-identifier-algorithm-shared';
import { makeHasher } from '@selected-algo';
import { createWorker } from './baseWorker';

const MAX_ROWS_TO_PREVIEW = 500;

export type ProcessPayload = { config: Config.FileConfiguration; inputPath: string; outputPath: string; outputFormat?: SUPPORTED_FILE_TYPES };
export type ProcessResult = {
  isMappingDocument: boolean;
  document: CidDocument;
  outputFilePath?: string;
  mappingFilePath: string;
};

createWorker<ProcessPayload, ProcessResult>(async ({ config, inputPath, outputPath, outputFormat }) => {
  console.log("Processing worker started for file:", inputPath);
  const { isMappingDocument, document, outputFilePath, mappingFilePath } =
    await processFile({
      config,
      inputFilePath: inputPath,
      outputPath,
      hasherFactory: makeHasher,
      format: outputFormat,
    });
  console.debug(`File processing complete. isMappingDocument=${isMappingDocument}`);

  // don't return large datasets back to the frontend, instead splice and send n rows
  if (document.data.length > MAX_ROWS_TO_PREVIEW) {
    console.warn(`Dataset has ${document.data.length} rows, trimming to ${MAX_ROWS_TO_PREVIEW} for frontend preview`);
    document.data = document.data.slice(0, MAX_ROWS_TO_PREVIEW);
  }

  console.log(`Finished processing worker, returning result to main process.`);
  return { isMappingDocument, document, outputFilePath, mappingFilePath };
});
