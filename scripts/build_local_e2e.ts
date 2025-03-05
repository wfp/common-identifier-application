import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { promisify } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const execPromise = promisify(exec);

// change this struct to build the application with the correct algorithm
const ALGO = {
  regionName: "syria",
  regionCode: "SYR"
}
const REPO_URL = 'https://github.com/wfp/common-identifier-algorithms';
const REPO_DIR = join(__dirname, '..', 'algo_repo');
const SOURCE_DIR = join(REPO_DIR, 'algorithms', ALGO.regionName);
const DEST_DIR = join(__dirname, '..', 'electron', 'main', 'algo');

async function runCommand(command: string) {
    console.log(`Running command: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(`OUT: ${stdout}`);
    if (stderr) console.error(`ERR: ${stderr}`);
}

async function cleanUpRepo() {
    if (await fs.stat(REPO_DIR).catch(() => false)) {
        await fs.rm(REPO_DIR, { recursive: true, force: true });
    }
}

async function cloneRepo() {
    await runCommand(`git clone --filter=blob:none --no-checkout --depth 1 ${REPO_URL} ${REPO_DIR}`);
}

async function checkoutAlgorithm() {
    process.chdir(REPO_DIR);
    await runCommand('git sparse-checkout init --no-cone');
    await runCommand(`git sparse-checkout set algorithms/${ALGO.regionName}`);
    await runCommand('git checkout');
}

async function copyAlgorithm() {
    await fs.mkdir(DEST_DIR, { recursive: true });
    await fs.cp(SOURCE_DIR, DEST_DIR, { recursive: true });
}

async function buildApplication() {
    await cleanUpRepo();
    await runCommand('echo NWS');
    await runCommand('npm run clean:app');
    await cloneRepo();
    await checkoutAlgorithm();
    await copyAlgorithm();
    process.chdir(join(__dirname, '..'));
    await fs.rm(REPO_DIR, { recursive: true, force: true });
    await runCommand('npm install');
    await runCommand(`tsx scripts/activate-algo.ts ${ALGO.regionCode}`);
    await runCommand('npm run build');
    await runCommand(`tsx scripts/update-rendered-components.ts ${ALGO.regionCode}`);
    await runCommand(`tsx scripts/prepackage.ts ${ALGO.regionCode}`);
    await runCommand('npm run package');
    await runCommand('tsx scripts/clean.ts');
    console.log('DONE');
}

buildApplication().catch(err => {
    console.error('Build process failed:', err);
});