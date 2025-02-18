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
import { writeFileSync, copyFileSync } from 'node:fs';
import { program as programme } from 'commander';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateConfigHash, attemptToReadTOMLData, validateConfig  } from 'common-identifier-algorithm-shared';
import type { Config  } from 'common-identifier-algorithm-shared';

const __dirname = dirname(fileURLToPath(import.meta.url));

programme.argument('<region_code>', 'Region code for this algorithm deployment');
programme.parse();

const REGION_CODE = programme.args[0].toUpperCase();

const MAIN_DIR = join(__dirname, '..', 'electron', 'main');
const BACKUP_CONFIG_TARGET_PATH = join(__dirname, '..', 'public', 'config.backup.toml'); // public since vite looks here for static assets

function copyBackupConfig() {
  // the algorithm directory
  const algoDir = join(MAIN_DIR, "algo");
  
  const backupConfigSource = join(algoDir, 'config', 'config.backup.toml');

  if (!checkConfigSignature(backupConfigSource, REGION_CODE)) {
    console.error("ERROR: could not validate backup configuration file");
    return
  }

  console.log('Copying backup config from', backupConfigSource);
  console.log('                        to', BACKUP_CONFIG_TARGET_PATH);

  copyFileSync(backupConfigSource, BACKUP_CONFIG_TARGET_PATH);
}

function checkConfigSignature(filePath: string, region: string) {
  const config = attemptToReadTOMLData<Config.Options>(filePath, "utf-8");
  if (!config) {
    console.error(`ERROR: could not read configuration file: ${filePath}`);
    return false;
  }

  const validationResult = validateConfig(config, region);
  if (!!validationResult) {
    console.error(`ERROR: could not validate configuration file: ${validationResult}`);
    return false;
  }
  const hash = generateConfigHash(config);

  if (hash !== config.meta.signature) {
    console.error(`ERROR: configuration file contains invalid signature`)
    console.error(`       EXPECTED: ${hash}`);
    console.error(`            GOT: ${hash}`);
    return false;
  }
  return true;
}

copyBackupConfig();

