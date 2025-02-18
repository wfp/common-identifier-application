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
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAIN_DIR = join(__dirname, '..', 'electron', 'main');
const ACTIVE_ALGORITHM_FILE = join(MAIN_DIR, 'active_algorithm.ts');
const BACKUP_CONFIG_TARGET_PATH = join(__dirname, '..', 'public', 'config.backup.toml'); // public since vite looks here for static assets

function writeActiveAlgorithm() {
  console.log('Generating', ACTIVE_ALGORITHM_FILE);

  const ACTIVE_ALGO_CONTENTS = `
    // THIS FILE IS AUTO-GENERATED, YOUR EDITS MAY BE OVERWRITTEN DURING BUILD
    export { REGION, makeHasher } from './${"algo"}/index';
    `;

  writeFileSync(ACTIVE_ALGORITHM_FILE, ACTIVE_ALGO_CONTENTS, 'utf-8');
}

function copyBackupConfig() {
  // TODO: check that the meta.signature in the downloaded config file is correct.
  // the algorithm directory
  const algoDir = join(MAIN_DIR, "algo");

  const backupConfigSource = join(algoDir, 'config', 'config.backup.toml');

  console.log('Copying backup config from', backupConfigSource);
  console.log('                        to', BACKUP_CONFIG_TARGET_PATH);

  copyFileSync(backupConfigSource, BACKUP_CONFIG_TARGET_PATH);
}

writeActiveAlgorithm();
copyBackupConfig();
