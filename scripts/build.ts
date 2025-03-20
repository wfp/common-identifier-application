import { Command } from '@commander-js/extra-typings';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { promisify } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const execPromise = promisify(exec);

const program = new Command()
  .requiredOption('--directory <ALGORITHM_DIRECORY>', 'The name of the algorithm directory')       // i.e. syria
  .requiredOption('--short-code <ALGORITHM_SHORT_CODE>', 'The algorithm code AKA the region code') // i.e. SYR
  .option('--no-build', 'Build the application')
  .option('--run-tests', 'Run the test suite')
  .option('--package', 'Package the application')
  .option('--repository-url [REPO_URL]', 'The algorithm repository url', 'https://github.com/wfp/common-identifier-algorithms') // could be a local directory if needed

program.parse();

const PROG_OPTIONS = program.opts();

const REPO_DIR = join(__dirname, '..', 'algo_repo');
const SOURCE_DIR = join(REPO_DIR, 'algorithms', PROG_OPTIONS.directory);
const DEST_DIR = join(__dirname, '..', 'electron', 'main', 'algo');

async function runCommand(command: string) {
  console.log(`Running command: ${command}`);
  const { stdout, stderr } = await execPromise(command);
  if (stdout) console.log(`OUT: ${stdout}`);
  if (stderr) console.error(`ERR: ${stderr}`);
}

async function cleanUpRepo() {
  if (await fs.stat(REPO_DIR).catch(() => false)) await fs.rm(REPO_DIR, { recursive: true, force: true });
}

async function cloneRepo() {
  await runCommand(`git clone --filter=blob:none --no-checkout --depth 1 ${PROG_OPTIONS.repositoryUrl} ${REPO_DIR}`);
}

async function checkoutAlgorithm() {
  process.chdir(REPO_DIR);
  await runCommand('git sparse-checkout init --no-cone');
  await runCommand(`git sparse-checkout set algorithms/${PROG_OPTIONS.directory}`);
  await runCommand('git checkout');
}

async function copyAlgorithm() {
  await fs.mkdir(DEST_DIR, { recursive: true });
  await fs.cp(SOURCE_DIR, DEST_DIR, { recursive: true });
}

async function buildApplication() {
  await runCommand(`echo Building Application: algo=${PROG_OPTIONS.directory}, code=${PROG_OPTIONS.shortCode}`);
  await cleanUpRepo(); // this can't be baked into the npm script since it is a separate git repo
  await runCommand('npm run clean:app');
  await cloneRepo();
  await checkoutAlgorithm();
  await copyAlgorithm();

  process.chdir(join(__dirname, '..'));
  await fs.rm(REPO_DIR, { recursive: true, force: true });
  
  await runCommand('npm install');
  await runCommand(`tsx scripts/activate-algo.ts ${PROG_OPTIONS.shortCode}`);

  if (PROG_OPTIONS.runTests) {
    console.log("Running tests");
    await runCommand('npm run test');
  }
  
  if (PROG_OPTIONS.build) {
    console.log("Building app");
    await runCommand('npm run build');
    await runCommand(`tsx scripts/update-rendered-components.ts ${PROG_OPTIONS.shortCode}`);
  }
  
  if (PROG_OPTIONS.build && PROG_OPTIONS.package) {
    console.log("Packaging app");
    await runCommand(`tsx scripts/prepackage.ts ${PROG_OPTIONS.shortCode}`);
    // Package uses electron builder and requires env vars for Azure signing to be set
    await runCommand('npm run package');
  }
  await runCommand('tsx scripts/clean.ts');
  console.log('DONE');
}

buildApplication().catch(err => {
  console.error('Build process failed:', err);
});