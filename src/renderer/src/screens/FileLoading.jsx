/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
  const splitName = filePath.split(/[\\/]/);
  return splitName[splitName.length - 1];
}

function FileLoading({ inputFilePath }) {
  console.log(inputFilePath);
  return (
    <div className="FileLoading appScreen progressIndicator">
      <div className="loaderWrapper">
        <span className="loader"></span>
      </div>
      <div className="help">
        {inputFilePath.length === 0 ? (
          <p>Loading file...</p>
        ) : (
          <p>
            Loading file:{' '}
            <span className="fileName">{baseFileName(inputFilePath)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default FileLoading;
