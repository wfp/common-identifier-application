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

import BottomButtons from '../components/BottomButtons';
import FileInfo from '../components/FileInfo';
import PreviewTable from '../components/PreviewTable';
import { useAppStore } from '../store';
import type { IProcessingFinished } from '../types';

function ProcessingFinished({
  config, isMappingDocument, document, outputFilePath, mappingFilePath,
}: Omit<IProcessingFinished, "screen">) {
  const backToMainScreen = useAppStore((store) => store.backToMainScreen);
  const preProcessFileOpenDialog = useAppStore(
    (store) => store.preProcessFileOpenDialog,
  );

  const fileInfoRow = isMappingDocument ? (
    <FileInfo filePath={mappingFilePath} helpText="Saved as" />
  ) : (
    <FileInfo
      filePath={outputFilePath}
      otherFilePath={mappingFilePath}
      helpText="Saved as"
    />
  );

  // if this was a mapping-only document
  const columnsConfig = isMappingDocument
    ? config.data.destination_map.columns
    : config.data.destination.columns;

  return (
    <div className="ProcessingFinished">
      {fileInfoRow}

      <PreviewTable tableData={document.data} columnsConfig={columnsConfig} />

      <BottomButtons
        l_content="Open a different file"
        l_onClick={preProcessFileOpenDialog}
        r_onClick={backToMainScreen}
        r_content="Done"
      />
    </div>
  );
}

export default ProcessingFinished;
