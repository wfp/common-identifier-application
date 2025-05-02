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


import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from '@commander-js/extra-typings';

const __dirname = dirname(fileURLToPath(import.meta.url));

const programme = new Command()
    .requiredOption('--algorithm-id <ALGORITHM_ID>', 'The id of the algorithm distribution, typically config.meta.id')
    .option('--no-validate-env', 'Don\'t validate environment variables', false);
programme.parse();

const PACKAGE_PATH = join(__dirname, '..', 'package.json');
const PACKAGE_OLD_PATH = join(__dirname, '..', 'package.old.json');
const PACKAGE_LOCK_PATH = join(__dirname, '..', 'package-lock.json');
const PACKAGE_LOCK_OLD_PATH = join(__dirname, '..', 'package-lock.old.json');
const BUILDER_PATH = join(__dirname, '..', 'electron-builder.json');
const BUILDER_OLD_PATH = join(__dirname, '..', 'electron-builder.old.json');

const backupFileIfExists = (filePath: string, backupPath: string) => !existsSync(backupPath) ? copyFileSync(filePath, backupPath) : undefined;

function validateEnvVars() {
    if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
        throw new Error("ERROR: Environment variables for Azure Trusted Signing not found.")
    }
    // TODO: add other env vars here to validate
}

// update the electron-builder configuration
//   - append algo shortcode to productName
//   - append algo shortcode to nsis.shortcutName
function updateBuildConfiguration() {
    const ebRaw = readFileSync(BUILDER_PATH);
    const ebJSON = JSON.parse(ebRaw.toString());

    // only backup the file if this script hasn't been run before
    backupFileIfExists(BUILDER_PATH, BUILDER_OLD_PATH);
    
    ebJSON.productName = ebJSON.productName + '-' + programme.opts().algorithmId.toLowerCase();
    ebJSON.appId = ebJSON.appId + programme.opts().algorithmId.toLowerCase();
    ebJSON.directories.output = "release/" + programme.opts().algorithmId + "-${version}";
    ebJSON.nsis.shortcutName = ebJSON.nsis.shortcutName + ' - ' + programme.opts().algorithmId.toUpperCase();
    ebJSON.nsis.uninstallDisplayName = ebJSON.nsis.uninstallDisplayName + ' - ' + programme.opts().algorithmId.toUpperCase()

    writeFileSync(BUILDER_PATH, JSON.stringify(ebJSON, null, 2));
}


// update the package.json
//   - append algo shortcode to name (to alter the installation directory since it can't be overriden)
function updatePackageJson() {
    // update the package.name field to append the algo shortcode
    // this name is used as the installation directory name, and it cannot be overridden in
    // the electron-builder configuration without custom NSIS macros.
    // TODO: investigate a better way to do this... @scopes maybe?
    const pkgRaw = readFileSync(PACKAGE_PATH);
    const pkgJSON = JSON.parse(pkgRaw.toString());

    // only backup the file if this script hasn't been run before
    backupFileIfExists(PACKAGE_PATH, PACKAGE_OLD_PATH);

    pkgJSON.name = pkgJSON.name + '-' + programme.opts().algorithmId.toLowerCase();
    
    writeFileSync(PACKAGE_PATH, JSON.stringify(pkgJSON, null, 2));
}

function updatePackageLockJson() {
    // only backup the file if this script hasn't been run before
    backupFileIfExists(PACKAGE_LOCK_PATH, PACKAGE_LOCK_OLD_PATH);
}

function main() {
    if (programme.opts().validateEnv) validateEnvVars();

    updateBuildConfiguration();
    updatePackageJson();
    updatePackageLockJson();
}
main()