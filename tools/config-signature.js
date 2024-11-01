// COMMAND-LINE WRAPPER TO GENERATE SIGNATURES FOR CONFIG FILES
import { program } from 'commander';
import { generateConfigHash } from '../src/main/algo-shared/config/generateConfigHash.js';
import { attemptToReadTOMLData } from '../src/main/algo-shared/config/utils.js';
import { CONFIG_FILE_ENCODING } from '../src/main/algo-shared/config/loadConfig.js';

program
    .argument('<path>', 'Config file to generate signatures for')

program.parse();

const options = program.opts();

// APP STARTS HERE
// ---------------


const configFile = program.args[0];

console.log("Opening file: ", configFile)
const config = attemptToReadTOMLData(configFile, CONFIG_FILE_ENCODING);
const hash = generateConfigHash(config);

console.log("HASH:", hash);
