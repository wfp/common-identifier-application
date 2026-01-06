import { Command } from '@commander-js/extra-typings';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const program = new Command()
  .requiredOption('--algorithm-name <ALGORITHM_NAME>', 'The name of the algorithm, typically the directory name')       // i.e. syria
  .requiredOption('--algorithm-id <ALGORITHM_ID>', 'The algorithm id, typically found at config.meta.id') // i.e. SYR
  .option('--no-build', 'Don\'t build the application')
  .option('--run-tests', 'Run the test suite')
  .option('--ignore-errors', 'Ignore errors in subcommands, useful for test failures', false)
  .option('--package', 'Package the application')

program.parse();

const PROG_OPTIONS = program.opts();

if (PROG_OPTIONS.package && !PROG_OPTIONS.build)
  throw new Error("ERROR: Unable to package the application without also building it, remove the --no-build flag");

async function runCommand(command: string) {
  console.log(`Running command: ${command}\n`);
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(`OUTPUT: \n${stdout}`);
    if (stderr) console.error(`ERROR: \n${stderr}`);
  } catch (error: any) {
    if (!PROG_OPTIONS.ignoreErrors) {
      console.error(`Command execution failed: ` + error.message);
      throw error;
    }
  }
}


async function buildApplication() {
  console.log(`Building Application: algo=${PROG_OPTIONS.algorithmName}, code=${PROG_OPTIONS.algorithmId}`);

  await runCommand('npm run clean:app');
  
  await runCommand('npm install');
  await runCommand(`tsx scripts/activate-algorithm.ts --algorithm-name ${PROG_OPTIONS.algorithmName}`);

  if (PROG_OPTIONS.runTests) {
    console.log("Running tests");
    await runCommand('npm run test:coverage');
  }
  
  if (PROG_OPTIONS.build) {
    console.log("Building app");
    // [NOTE] setting the SELECTED_ALGORITHM env var here since vite does not support passing in params.
    process.env.SELECTED_ALGORITHM = PROG_OPTIONS.algorithmName;
    await runCommand('npm run build');
    await runCommand(`tsx scripts/update-rendered-components.ts --suffix ${PROG_OPTIONS.algorithmId}`);
  }
  
  if (PROG_OPTIONS.build && PROG_OPTIONS.package) {
    console.log("Packaging app");
    await runCommand(`tsx scripts/prepackage.ts --algorithm-id ${PROG_OPTIONS.algorithmId}`);
    await runCommand('npm run package');
  }

  await runCommand('tsx scripts/clean.ts');
  console.log('DONE');
}

buildApplication().catch(err => {
  console.error('Build process failed:', err);
  process.exit(1);
});