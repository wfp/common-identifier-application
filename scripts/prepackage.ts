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
import { program } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));

program.argument('<region>', 'The region suffix to append.');
program.parse();

const ALGO_REGION = program.args[0];

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
//   - append region shortcode to productName
//   - append region shortcode to nsis.shortcutName
function updateBuildConfiguration() {
    const ebRaw = readFileSync(BUILDER_PATH);
    const ebJSON = JSON.parse(ebRaw.toString());

    // only backup the file if this script hasn't been run before
    backupFileIfExists(BUILDER_PATH, BUILDER_OLD_PATH);
    
    ebJSON.productName = ebJSON.productName + '-' + ALGO_REGION.toLowerCase();
    ebJSON.appId = ebJSON.appId + ALGO_REGION.toLowerCase();
    ebJSON.directories.output = "release/" + ALGO_REGION + "-${version}";
    ebJSON.nsis.shortcutName = ebJSON.nsis.shortcutName + ' - ' + ALGO_REGION.toUpperCase();
    ebJSON.nsis.uninstallDisplayName = ebJSON.nsis.uninstallDisplayName + ' - ' + ALGO_REGION.toUpperCase()

    writeFileSync(BUILDER_PATH, JSON.stringify(ebJSON, null, 2));
}


// update the package.json
//   - append region shortcode to name (to alter the installation directory since it can't be overriden)
function updatePackageJson() {
    // update the package.name field to append the region shortcode
    // this name is used as the installation directory name, and it cannot be overridden in
    // the electron-builder configuration without custom NSIS macros.
    // TODO: investigate a better way to do this... @scopes maybe?
    const pkgRaw = readFileSync(PACKAGE_PATH);
    const pkgJSON = JSON.parse(pkgRaw.toString());

    // only backup the file if this script hasn't been run before
    backupFileIfExists(PACKAGE_PATH, PACKAGE_OLD_PATH);

    pkgJSON.name = pkgJSON.name + '-' + ALGO_REGION.toLowerCase();
    
    writeFileSync(PACKAGE_PATH, JSON.stringify(pkgJSON, null, 2));
}

function updatePackageLockJson() {
    // only backup the file if this script hasn't been run before
    backupFileIfExists(PACKAGE_LOCK_PATH, PACKAGE_LOCK_OLD_PATH);
}

updateBuildConfiguration();
updatePackageJson();
updatePackageLockJson();
validateEnvVars();