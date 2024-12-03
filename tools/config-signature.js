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