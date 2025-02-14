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

import type { ConfigStore } from 'common-identifier-algorithm-shared';

import Debug from 'debug';
const log = Debug('CID:main:ipc::requestConfigUpdate');

export function requestConfigUpdate({
  configStore,
}: {
  configStore: ConfigStore;
}) {
  log('App requesting config udpate');

  const config = configStore.getConfig();
  // return the data
  return {
    config,
    isBackup: configStore.isUsingBackupConfig,
    lastUpdated: configStore.lastUpdated,
    error: configStore.loadError,
    hasAcceptedTermsAndConditions: configStore.hasAcceptedTermsAndConditions(),
  };
}
