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
import Debug from 'debug';
import type { IRemoveUserConfig } from '../../../common/types';
const log = Debug('cid::electron::ipc::removeUserConfig');

// Removes the user configuration and falls back to the built-in default
export function removeUserConfig(configStore: ConfigStore): IRemoveUserConfig {
  log('[INFO] start');

  const loadError = configStore.removeUserConfig();

  log('[INFO] result: ', loadError);

  const config = configStore.getConfig();
  if (config === undefined) {
    log(`[ERROR] Config undefined -- Unable to read current or backup configuration file: ${configStore.getConfigFilePath()} || ${configStore.getBackupConfigFilePath()}`);
    throw new Error(`Unable to read configuration file: ${configStore.getConfigFilePath()} || ${configStore.getBackupConfigFilePath()}`);
  }
  if (!loadError) {
    return {
      success: true,
      config,
      lastUpdated: configStore.lastUpdated,
    };
  }

  return {
    success: false,
    config,
    lastUpdated: configStore.lastUpdated,
    error: loadError,
  };
}
