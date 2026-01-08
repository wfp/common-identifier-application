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

import createDebug from 'debug';
import log from 'electron-log/main';

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
export function baseFileName(filePath: string) {
  const splitName = filePath.split(/[\\/]/);
  const lastComponent = splitName[splitName.length - 1].split(/\.+/);
  return lastComponent.slice(0, -1).join('.');
}

// TODO: I hate this function but it works, revisit and cleanup later. Look at electron-log scopes to isolate engine logs.
export function registerLogHandlers() {
  log.transports.file.level = "debug";
  log.transports.file.maxSize = 1024 * 1024; // 1MB for now, tune this later.

  log.transports.console.level = "info"; // Disable console logging
  log.transports.ipc.level = false; // Disable IPC logging
  
  const engineLog = log.scope("engine");
  log.initialize();

  const logRegex = /(?<namespace>cid::[A-Za-z0-9_:.-]+)\s+\[(?<level>INFO|DEBUG|ERROR|WARN)\]\s+(?<message>.*)/;

  // TODO: descope this namespace to only log sensible events; there is not need to log everything all the time.
  createDebug.enable("cid::*");

  createDebug.log = (...args: unknown[]) => {
    try {
      if (typeof args[0] === "string") {
        const matches = args[0].match(logRegex);
        if (!matches || !matches.groups) {
          engineLog.debug(String(args[0]));
          return;
        }

        const message = `${matches.groups.namespace} - ${matches.groups.message}`;
        switch (matches.groups.level) {
          case "DEBUG":
            engineLog.debug(message);
            return;
          case "INFO":
            engineLog.info(message);
            return;
          case "WARN":
            engineLog.warn(message);
            return;
          case "ERROR":
            engineLog.error(message);
            return;
          default:
            engineLog.debug(message);
        }
      }
      else engineLog.debug(String(args[0]));
    }
    catch (err) {
      engineLog.error("Log handler error:", err);
      engineLog.debug(String(args[0]));
    }
  }
}
