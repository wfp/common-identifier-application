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


import { copyFileSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));


const PACKAGE_PATH = join(__dirname, '..', 'package.json');
const PACKAGE_OLD_PATH = join(__dirname, '..', 'package.old.json');
const BUILDER_PATH = join(__dirname, '..', 'electron-builder.json');
const BUILDER_OLD_PATH = join(__dirname, '..', 'electron-builder.old.json');

function revertChangesToConfigs() {
    if (!existsSync(PACKAGE_OLD_PATH)) {
        console.warn("WARN: package.old.json does not exists, not overwriting file. ");
    } else {
        console.log(`Overwriting ${PACKAGE_PATH} with ${PACKAGE_OLD_PATH}`);
        copyFileSync(PACKAGE_OLD_PATH, PACKAGE_PATH);
        unlinkSync(PACKAGE_OLD_PATH);
    }

    if (!existsSync(BUILDER_OLD_PATH)) {
        console.warn("WARN: electron-builder.old.json does not exists, not overwriting file. ");
    } else {
        console.log(`Overwriting ${BUILDER_PATH} with ${BUILDER_OLD_PATH}`);
        copyFileSync(BUILDER_OLD_PATH, BUILDER_PATH);
        unlinkSync(BUILDER_OLD_PATH);
    }
}
revertChangesToConfigs()