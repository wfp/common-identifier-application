const fs = require('node:fs');
const path = require('node:path');
const toml = require('toml');
const { program } = require('commander');

program
    .argument('<algo>', 'The name of the directory inside "src/main/" to activate')

program.parse();

const options = program.opts();

// APP STARTS HERE
// ---------------

// the 'src/main' directory
const SRC_MAIN_DIR = path.join(__dirname, "..", "src", "main");

// the active algorithm file
const ACTIVE_ALGORITHM_FILE = path.join(SRC_MAIN_DIR, "active_algorithm.js");

// the backup config file used for packaging
const BACKUP_CONFIG_TARGET_PATH = path.join(SRC_MAIN_DIR, "config.backup.toml");

// re-create the 'active_algorithm' file
// fs.writeFileSync()


const algoName = program.args[0];

console.log("Activating algoirhtm:", algoName);

// WRITE ACTIVE ALGORITHM
// ----------------------

console.log("Generating", ACTIVE_ALGORITHM_FILE);

const ACTIVE_ALGO_CONTENTS = `
// THIS FILE IS AUTO-GENERATED, YOUR EDITS MAY BE OVERWRITTEN DURING BUILD
module.exports = require('./${algoName}');
`;

fs.writeFileSync(ACTIVE_ALGORITHM_FILE, ACTIVE_ALGO_CONTENTS, 'utf-8');

// COPY BACKUP CONFIG
// ------------------

// the algorithm directory
const algoDir = path.join(SRC_MAIN_DIR, algoName);

const backupConfigSource = path.join(algoDir, 'config', 'config.backup.toml');

console.log("Copying backup config from", backupConfigSource );
console.log("                        to", BACKUP_CONFIG_TARGET_PATH );

fs.copyFileSync(backupConfigSource, BACKUP_CONFIG_TARGET_PATH);

// const config = attemptToReadTOMLData(configFile, CONFIG_FILE_ENCODING);
// const hash = generateConfigHash(config);

// console.log("HASH:", hash);
