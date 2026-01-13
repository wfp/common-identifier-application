import { Command } from '@commander-js/extra-typings';
import { resolve } from 'node:path';

import { generateConfigHash, attemptToReadTOMLData, validateConfigFile  } from '@wfp/common-identifier-algorithm-shared';
import type { Config } from '@wfp/common-identifier-algorithm-shared';


const program = new Command()
.argument('[config-file-path]')
  .argument('[algorithm-id]')
program.parse();

function checkConfigSignature(filePath: string, algorithmId: string) {
  const config = attemptToReadTOMLData<Config.FileConfiguration>(filePath, "utf-8");
  if (!config) {
    console.error(`ERROR: could not read configuration file: ${filePath}`);
    return false;
  }

  const validationResult = validateConfigFile(config, algorithmId);
  if (!!validationResult) {
    console.error(`ERROR: could not validate configuration file: ${validationResult}`);
    return false;
  }
  const hash = generateConfigHash(config);

  console.log(`Configuration file signatures`);
  console.log(`       EXPECTED: ${hash}`);
  console.log(`            GOT: ${config.meta.signature}`);
}

(() => {
  const configFilePath = resolve(program.args[0]);
  checkConfigSignature(configFilePath, program.args[1]) ? process.exit(0) : process.exit(1);
})()