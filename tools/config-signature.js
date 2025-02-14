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
import { generateConfigHash, attemptToReadTOMLData, validateConfig  } from 'common-identifier-algorithm-shared';

programme.argument('<path>', 'Config file to generate signatures for');
programme.argument('<region>', 'Region for this algorithm deployment');

programme.parse();

// APP STARTS HERE
// ---------------

const configFile = programme.args[0];
const region = programme.args[1]

console.log('Opening file: ', configFile);
const config = attemptToReadTOMLData(configFile, "utf-8");
const validationResult = validateConfig(config, region);

if (!!validationResult) {
    console.error("ERROR: " + validationResult);
} else {
    const hash = generateConfigHash(config);
    console.log('HASH:', hash);
}