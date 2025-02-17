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


import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));

program.argument('<region>', 'The region suffix to append.');
program.parse();

const ALGO_REGION = program.args[0];

const PACKAGE_PATH = join(__dirname, '..', 'package.json');
const PACKAGE_OLD_PATH = join(__dirname, '..', 'package.old.json');
const BUILDER_PATH = join(__dirname, '..', 'electron-builder.json');
const BUILDER_OLD_PATH = join(__dirname, '..', 'electron-builder.old.json');

// update the electron-builder configuration
//   - append region shortcode to productName
//   - append region shortcode to nsis.shortcutName
function updateBuildConfiguration() {
    copyFileSync(BUILDER_PATH, BUILDER_OLD_PATH);
    const ebRaw = readFileSync(BUILDER_PATH);
    const ebJSON = JSON.parse(ebRaw);
    
    ebJSON.productName = ebJSON.productName + '-' + ALGO_REGION.toLowerCase();
    ebJSON.nsis.shortcutName = ebJSON.nsis.shortcutName + ' - ' + ALGO_REGION.toUpperCase();

    writeFileSync(BUILDER_PATH, JSON.stringify(ebJSON, null, 2));
}


// update the package.json
//   - append region shortcode to name (to alter the installation directory since it can't be overriden)
function updatePackageJson() {
    copyFileSync(PACKAGE_PATH, PACKAGE_OLD_PATH);
    // update the package.name field to append the region shortcode
    // this name is used as the installation directory name, and it cannot be overridden in
    // the electron-builder configuration without custom NSIS macros.
    // TODO: investigate a better way to do this... @scopes maybe?
    const pkgRaw = readFileSync(PACKAGE_PATH);
    
    const pkgJSON = JSON.parse(pkgRaw);
    pkgJSON.name = pkgJSON.name + '-' + ALGO_REGION.toLowerCase();
    
    writeFileSync(PACKAGE_PATH, JSON.stringify(pkgJSON, null, 2));
}

updateBuildConfiguration();
updatePackageJson();