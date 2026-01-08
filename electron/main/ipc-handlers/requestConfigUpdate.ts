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

import type { IRequestConfigUpdate } from '../../../common/types';

const ipcLog = log.scope("ipc:requestConfigUpdate"); 

export function requestConfigUpdate(configStore: ConfigStore): IRequestConfigUpdate {
  ipcLog.info('App requesting config update');

  const config = configStore.getConfig();
  if (config === undefined) {
    ipcLog.error(`Config undefined -- Unable to read current or backup configuration file: ${configStore.getConfigFilePath()} || ${configStore.getBackupConfigFilePath()}`);
    throw new Error(`Unable to read configuration file:
      ${configStore.getConfigFilePath()} || 
      ${configStore.getBackupConfigFilePath()}`
    );
  }
  ipcLog.info('Returning current configuration to renderer process');
  return {
    config,
    isBackup: configStore.isUsingBackupConfig,
    lastUpdated: configStore.lastUpdated,
    error: configStore.loadError,
    hasAcceptedTermsAndConditions: configStore.hasAcceptedTermsAndConditions(),
  };
}
