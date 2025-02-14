// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { keepOutputColumns } from '../util';
import BottomButtons from '../components/BottomButtons';
import FileInfo from '../components/FileInfo';
import PreviewTable from '../components/PreviewTable';
import { useAppStore } from '../store';
import type { IValidationFailed } from '../types';

function OpenErrorListButton({ errorFilePath }: { errorFilePath: string}) {
  const openOutputPath = useAppStore((store) => store.openOutputFile);

  // open the output file
  function openOutputFile() {
    openOutputPath(errorFilePath);
  }

  return (
    <button
      className="cid-button cid-button-lg cid-button-alert"
      onClick={openOutputFile}
    >
      Open error list
    </button>
  );
}

function ValidationFailed({
  config, document, inputFilePath, errorFilePath, isMappingDocument,
}: Omit<IValidationFailed, "screen">) {
  const startPreProcessingFile = useAppStore((store) => store.startPreProcessingFile);
  const preProcessFileOpenDialog = useAppStore((store) => store.preProcessFileOpenDialog);

  // on retry we simply re-submit the same path
  const retryFileLoad = () => startPreProcessingFile(inputFilePath);

  // Add the row number to the list of regular error columns for display
  let columnsConfig = config.data.destination_errors.columns;

  // if this is a mapping document we need to clean the schema
  if (isMappingDocument) {
    columnsConfig = [
      // we need to re-add the errors column here to keep the column filtering
      // logic consistent across mapping and non-mapping documents
      { name: 'Errors', alias: 'errors' },
    ].concat(keepOutputColumns(config.data, {columns: columnsConfig}).columns);
  }

  // add the error column to the front of the column list
  const errorColumns = [{ name: 'Row #', alias: 'row_number' }].concat(
    columnsConfig,
  );

  // The file invalid message differs between mapping & assistance documents
  const fileIsNotValidMessage =
    'Validation finished. Critical errors encountered.';

  return (
    <div className="ValidationFailed appScreen">
      <FileInfo filePath={inputFilePath} helpText="The input file is invalid" />

      <PreviewTable tableData={document.data} columnsConfig={errorColumns} />

      <div className="validationResult error">
        <div className="validationState">
          {fileIsNotValidMessage}
          <div className="help">
            You cannot continue until the noted issues are resolved.
          </div>
        </div>

        <OpenErrorListButton errorFilePath={errorFilePath} />
      </div>

      <BottomButtons
        l_content="Open a different file"
        l_onClick={preProcessFileOpenDialog}
        r_onClick={retryFileLoad}
        r_content="Retry the same file"
      />
    </div>
  );
}

export default ValidationFailed;
