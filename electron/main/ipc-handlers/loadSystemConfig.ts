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

import type { ConfigStore } from '@wfp/common-identifier-algorithm-shared';
import log from "electron-log/main";

import type { ILoadSystemConfig } from '../../../common/types';

const ipcLog = log.scope("ipc:loadSystemConfig"); 

// Really, this is called on boot only
export function loadSystemConfig(configStore: ConfigStore): ILoadSystemConfig {
  ipcLog.info('Loading config from store');

  const config = configStore.getConfig();

  if (!config) {
    const message = `No configuration found -- Unable to read current or backup configuration file: ${configStore.getConfigFilePath()} || ${configStore.getBackupConfigFilePath()}`;
    ipcLog.error(message);
    return { status: "failed", error: message };
  }

  ipcLog.info('Returning current configuration to renderer process');
  return {
    status: "success",
    config,
    isBackup: configStore.isUsingBackupConfig,
    lastUpdated: configStore.lastUpdated,
    hasAcceptedTermsAndConditions: configStore.hasAcceptedTermsAndConditions(),
  };
}
