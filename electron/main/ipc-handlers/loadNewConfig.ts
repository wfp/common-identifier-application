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

import { dialog } from 'electron';
import log from "electron-log/main";
import type { ConfigStore } from '@wfp/common-identifier-algorithm-shared';

import type { ILoadNewConfig } from '../../../common/types';

const ipcLog = log.scope("ipc:loadNewConfig"); 

export async function loadNewConfig(configStore: ConfigStore): Promise<ILoadNewConfig> {
  ipcLog.info('App requested loading a new config');

  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'All config files', extensions: ['toml', 'json'] },
      { name: 'TOML files', extensions: ['toml'] },
      { name: 'JSON files', extensions: ['json'] },
    ],
  });
  const config = configStore.getConfig();
  if (config === undefined) {
    throw new Error(`Unable to read configuration file:
      ${configStore.getConfigFilePath()} || 
      ${configStore.getBackupConfigFilePath()}`
    );
  }

  if (!response.canceled) {
    // handle fully qualified file name
    const filePath = response.filePaths[0];
    ipcLog.info('Starting to load config file from open dialog: ', filePath);

    // attempt to load into the store
    const loadError = configStore.updateUserConfig(filePath);

    if (loadError) {
      ipcLog.error('CONFIG LOAD ERROR: ', loadError);
      return {
        success: false, cancelled: false,
        config, lastUpdated: configStore.lastUpdated,
        error: loadError,
      };
    }
  } else ipcLog.info('User cancelled config file open dialog');

  return {
    success: true, cancelled: response.canceled,
    config, lastUpdated: configStore.lastUpdated
  };
}
