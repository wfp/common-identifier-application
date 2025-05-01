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
// COMMAND-LINE WRAPPER TO GENERATE SIGNATURES FOR CONFIG FILES
import { program as programme } from 'commander';
import { generateConfigHash, attemptToReadTOMLData, validateConfigFile  } from 'common-identifier-algorithm-shared';
import type { Config  } from 'common-identifier-algorithm-shared';

programme.argument('<path>', 'Config file to generate signatures for');
programme.argument('<region>', 'Region for this algorithm deployment');

programme.parse();

// APP STARTS HERE
// ---------------

const FILE_PATH = programme.args[0];
const REGION_CODE = programme.args[1]

function checkConfigSignature() {
  const config = attemptToReadTOMLData<Config.FileConfiguration>(FILE_PATH, "utf-8");
  if (!config) {
    console.error(`ERROR: could not read configuration file: ${FILE_PATH}`);
    return;
  }

  const validationResult = validateConfigFile(config, REGION_CODE);
  if (!!validationResult) {
    console.error(`ERROR: could not validate configuration file: ${validationResult}`);
    return;
  }
  const hash = generateConfigHash(config);

  if (hash !== config.meta.signature) {
    console.error(`\nERROR: configuration file contains invalid signature`)
    console.error(`       EXPECTED: ${hash}`);
    console.error(`            GOT: ${hash}`);
  } else console.log('GENERATED HASH: ', hash);
  return;
}

checkConfigSignature()