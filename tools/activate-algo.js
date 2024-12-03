import {
  writeFileSync,
  copyFileSync,
  existsSync,
  readFileSync,
  appendFileSync,
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

const ALGO_REGION = program.args[1];

const SRC_MAIN_DIR = join(__dirname, '..', 'src', 'main');
const ACTIVE_ALGORITHM_FILE = join(SRC_MAIN_DIR, 'active_algorithm.ts');
const BACKUP_CONFIG_TARGET_PATH = join(SRC_MAIN_DIR, 'config.backup.toml');

const ALGO_DIR = join(SRC_MAIN_DIR, "algo");

const RENDERER_DIR = join(__dirname, '..', 'src', 'renderer');
const RENDERER_CSS_PATH = join(RENDERER_DIR, 'dist', 'assets', 'index.css');
const OVERRIDE_CSS_PATH = join(ALGO_DIR, 'config', 'override.css');
const RENDERER_HTML_PATH = join(RENDERER_DIR, 'renderer.html');

console.log('Activating algorithm:', "algo");

function writeActiveAlgorithm() {
  console.log('Generating', ACTIVE_ALGORITHM_FILE);

  const ACTIVE_ALGO_CONTENTS = `
    // THIS FILE IS AUTO-GENERATED, YOUR EDITS MAY BE OVERWRITTEN DURING BUILD
    export { REGION, makeHasher } from './${"algo"}/index.js';
    `;

  writeFileSync(ACTIVE_ALGORITHM_FILE, ACTIVE_ALGO_CONTENTS, 'utf-8');
}

function copyBackupConfig() {
  // the algorithm directory
  const algoDir = join(SRC_MAIN_DIR, "algo");

  const backupConfigSource = join(algoDir, 'config', 'config.backup.toml');

  console.log('Copying backup config from', backupConfigSource);
  console.log('                        to', BACKUP_CONFIG_TARGET_PATH);

  copyFileSync(backupConfigSource, BACKUP_CONFIG_TARGET_PATH);
}

// TODO: actually parse the CSS AST to make sure overrides make sense
function updateRenderedComponents() {
  if (!existsSync(OVERRIDE_CSS_PATH)) {
    console.warn(
      'WARNING: No css overrides present for selected algorithm, keeping index.css unchanged',
    );
    return;
  }
  const overrideCss = readFileSync(OVERRIDE_CSS_PATH, 'utf-8');
  // trim out file comment header
  const cssDeclarations = overrideCss.split('*/')[1].trim();
  if (cssDeclarations.length === 0) return;
  const sep = '\n/* ==== OVERRIDES ==== */\n';
  appendFileSync(RENDERER_CSS_PATH, sep + cssDeclarations);
}

function updateRenderedTitle() {
  const indexHtml = readFileSync(RENDERER_HTML_PATH, 'utf-8');
  const root = htmlParse(indexHtml);
  const title = root.querySelector('title');
  title.set_content(`Common Identifier Application - ${ALGO_REGION}`);
  writeFileSync(RENDERER_HTML_PATH, root.toString());
}

writeActiveAlgorithm();
copyBackupConfig();
updateRenderedComponents();
updateRenderedTitle();
