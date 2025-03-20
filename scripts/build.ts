import { Command } from '@commander-js/extra-typings';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { promisify } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const execPromise = promisify(exec);

const program = new Command()
  .requiredOption('--algorithm-directory <ALGORITHM_DIRECORY>', 'The name of the algorithm directory')       // i.e. syria
  .requiredOption('--algorithm-short-code <ALGORITHM_SHORT_CODE>', 'The algorithm code AKA the region code') // i.e. SYR
  .option('--no-build', 'Build the application')
  .option('--run-tests', 'Run the test suite')
  .option('--package', 'Package the application')
  .option('--repository-url [REPO_URL]', 'The algorithm repository url', 'https://github.com/wfp/common-identifier-algorithms') // could be a local directory if needed

program.parse();

const PROG_OPTIONS = program.opts();

if (PROG_OPTIONS.package && !PROG_OPTIONS.build)
  throw new Error("ERROR: Unable to package the application without also building it, remove the --no-build flag");

const REPO_DIR   = join(__dirname, '..', 'algo_repo');
const DEST_DIR   = join(__dirname, '..', 'electron', 'main', 'algo');
const SOURCE_DIR = join(REPO_DIR, 'algorithms', PROG_OPTIONS.algorithmDirectory);

async function runCommand(command: string) {
  console.log(`Running command: ${command}\n`);
  const { stdout, stderr } = await execPromise(command);
  if (stdout) console.log(`OUTPUT: \n${stdout}`);
  if (stderr) console.error(`ERROR: \n${stderr}`);
}

async function cleanUpRepo() {
  if (await fs.stat(REPO_DIR).catch(() => false)) await fs.rm(REPO_DIR, { recursive: true, force: true });
}

async function cloneAndCheckoutAlgorithm() {
  // shallow clone the algorithms repository
  await runCommand(`git clone --filter=blob:none --no-checkout --depth 1 ${PROG_OPTIONS.repositoryUrl} ${REPO_DIR}`);

  // checkout the selected algorithm from the algorithms repository
  process.chdir(REPO_DIR);
  await runCommand('git sparse-checkout init --no-cone');
  await runCommand(`git sparse-checkout set algorithms/${PROG_OPTIONS.algorithmDirectory}`);
  await runCommand('git checkout');

  // copy the checked out algorithm to ./electron/main/algo
  await fs.mkdir(DEST_DIR, { recursive: true });
  await fs.cp(SOURCE_DIR, DEST_DIR, { recursive: true });
}

async function buildApplication() {
  console.log(`Building Application: algo=${PROG_OPTIONS.algorithmDirectory}, code=${PROG_OPTIONS.algorithmShortCode}`);

  await cleanUpRepo(); // this can't be baked into the npm script since it is a separate git repo
  await runCommand('npm run clean:app');

  await cloneAndCheckoutAlgorithm();

  process.chdir(join(__dirname, '..'));
  await fs.rm(REPO_DIR, { recursive: true, force: true });
  
  await runCommand('npm install');
  await runCommand(`tsx scripts/activate-algo.ts ${PROG_OPTIONS.algorithmShortCode}`);

  if (PROG_OPTIONS.runTests) {
    console.log("Running tests");
    await runCommand('npm run test');
  }
  
  if (PROG_OPTIONS.build) {
    console.log("Building app");
    await runCommand('npm run build');
    await runCommand(`tsx scripts/update-rendered-components.ts ${PROG_OPTIONS.algorithmShortCode}`);
  }
  
  if (PROG_OPTIONS.build && PROG_OPTIONS.package) {
    console.log("Packaging app");
    await runCommand(`tsx scripts/prepackage.ts ${PROG_OPTIONS.algorithmShortCode}`);
    await runCommand('npm run package');
  }

  await runCommand('tsx scripts/clean.ts');
  console.log('DONE');
}

buildApplication().catch(err => {
  console.error('Build process failed:', err);
});