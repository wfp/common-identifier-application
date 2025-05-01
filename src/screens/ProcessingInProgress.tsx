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

function baseFileName(filePath: string) {
  const splitName = filePath.split(/[\\/]/);
  return splitName[splitName.length - 1];
}

function ProcessingInProgress({ inputFilePath } : {inputFilePath: string|undefined}) {
  return (
    <div className="ProcessingInProgress progressIndicator">
      <div className="loaderWrapper">
        <span className="loader"></span>
      </div>
      {/* <div className="help">Processing the file...</div> */}
      <div className="help">
        {!inputFilePath || inputFilePath.length === 0 ? (
          <p>Processing File...</p>
        ) : (
          <p>
            Processing File:{' '}
            <span className="fileName">{baseFileName(inputFilePath)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default ProcessingInProgress;
