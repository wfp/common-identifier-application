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
import {
  writeFileSync,
  copyFileSync,
  existsSync,
  readFileSync,
  appendFileSync,
  readdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as htmlParse } from 'node-html-parser';
import { program } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));

program.argument(
  '<region>',
  'The region suffix to append to rendered title components.',
);

program.parse();

const ALGO_REGION = program.args[0];

const MAIN_DIR = join(__dirname, '..', 'electron', 'main');
const ACTIVE_ALGORITHM_FILE = join(MAIN_DIR, 'active_algorithm.ts');
const BACKUP_CONFIG_TARGET_PATH = join(__dirname, '..', 'public', 'config.backup.toml'); // public since vite looks here for static assets

const ALGO_DIR = join(MAIN_DIR, "algo");

const RENDERER_DIR = join(__dirname, '..', 'dist');

console.log('Activating algorithm:', ALGO_REGION);

function writeActiveAlgorithm() {
  console.log('Generating', ACTIVE_ALGORITHM_FILE);

  const ACTIVE_ALGO_CONTENTS = `
    // THIS FILE IS AUTO-GENERATED, YOUR EDITS MAY BE OVERWRITTEN DURING BUILD
    export { REGION, makeHasher } from './${"algo"}/index';
    `;

  writeFileSync(ACTIVE_ALGORITHM_FILE, ACTIVE_ALGO_CONTENTS, 'utf-8');
}

function copyBackupConfig() {
  // the algorithm directory
  const algoDir = join(MAIN_DIR, "algo");

  const backupConfigSource = join(algoDir, 'config', 'config.backup.toml');

  console.log('Copying backup config from', backupConfigSource);
  console.log('                        to', BACKUP_CONFIG_TARGET_PATH);

  copyFileSync(backupConfigSource, BACKUP_CONFIG_TARGET_PATH);
}

// TODO: actually parse the CSS AST to make sure overrides make sense
function updateRenderedComponents() {
  const overrideCSSPath = join(ALGO_DIR, 'config', 'override.css');
  
  if (!existsSync(overrideCSSPath)) {
    console.warn('WARNING: No css overrides present for selected algorithm, keeping index.css unchanged');
    return;
  }

  // vite adds a random suffix onto the index.css filename, need to search for the bundled css file
  const assetPath = join(RENDERER_DIR, 'assets');
  const cssFile = readdirSync(assetPath).find(a => a.endsWith('.css'));
  const cssPath = join(assetPath, cssFile);

  const overrideCss = readFileSync(overrideCSSPath, 'utf-8');
  // trim out file comment header
  const cssDeclarations = overrideCss.split('*/')[1].trim();
  if (cssDeclarations.length === 0) {
    console.warn("WARNING: No css overrides specified in config/overrides.css, keeping index.css unchanged.")
    return;
  }
  const sep = '\n/* ==== OVERRIDES ==== */\n';
  appendFileSync(cssPath, sep + cssDeclarations);
}

function updateRenderedTitle() {
  const renderHTMLPath = join(RENDERER_DIR, 'index.html');
  const indexHtml = readFileSync(renderHTMLPath, 'utf-8');
  const root = htmlParse(indexHtml);
  const title = root.querySelector('title');
  title.set_content(`Common Identifier Application - ${ALGO_REGION}`);
  writeFileSync(renderHTMLPath, root.toString());
}

writeActiveAlgorithm();
copyBackupConfig();
updateRenderedComponents();
updateRenderedTitle();
