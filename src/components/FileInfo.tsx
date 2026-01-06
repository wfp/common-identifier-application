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

import { useAppStore } from '../store';

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath: string) {
  const splitName = filePath.split(/[\\/]/);
  return splitName[splitName.length - 1];
}

// A single link pointing to a file
function FileRow({ path, className="" }: { path: string, className?: string}) {
  const fileName = baseFileName(path);
  const openOutputPath = useAppStore((store) => store.openOutputFile);

  function clickHandler(e: React.UIEvent) {
    e.preventDefault();
    e.stopPropagation();

    openOutputPath(path);
  }

  return (
    <div className={'fileName ' + className}>
      <a href={'file://' + path} onClick={clickHandler} target="_blank">
        {/* 🔗  */}
        {fileName}
      </a>
    </div>
  );
}

// Provides a customizable information about the file-to-be-processed
function FileInfo({filePath, helpText, otherFilePath} : {filePath: string, helpText: string, otherFilePath?: string}) {
  // handle the second file row if needed
  let otherFileRow = <></>;
  if (otherFilePath) {
    otherFileRow = <FileRow path={otherFilePath} className="otherPath" />;
  }

  return (
    <div className="FileInfo">
      <div className="help">{helpText}</div>
      <FileRow path={filePath} />
      {otherFileRow}
    </div>
  );
}

export default FileInfo;
