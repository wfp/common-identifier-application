const electronInstaller = require('electron-winstaller');
const fs = require('node:fs')
const path = require('node:path')

const INPUT_DIRECTORY = path.join(__dirname, "out", "commonid-tool-win32-x64")
const OUTPUT_DIRECTORY = path.join(__dirname, "out", "installer-win32-x64")

const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"))



async function runBuild() {

    if (process.argv.length < 3) {
        console.error("Usage: node build-windows-installer <REGION>");
        process.exit(-1);
    }

    const region = process.argv[2];


    const appName = PACKAGE_JSON.name;
    const appVersion = PACKAGE_JSON.version;

    try {
        const buildOptions = {
            // appDirectory: '/tmp/build/my-app-64',
            appDirectory: INPUT_DIRECTORY,
            outputDirectory: OUTPUT_DIRECTORY,
            title: `${appName}-${region}`,
            noMsi: true,
            exe: `${appName}.exe`,
            // authors: 'WFP',

            // Version and description should come from package.json in the build `app.asar`

            // exe: 'commonid-tool.exe',
            // version: "0.9.17",
            // description: "Common Identifier generation tool for Assistance and Mapping documents.",

            setupExe: `${appName}-${region}-${appVersion} Setup.exe`
        };

        console.log("Starting installer build with options: ", buildOptions);

        await electronInstaller.createWindowsInstaller(buildOptions);
        console.log("DONE")

    } catch (e) {
        console.error(`ERROR WHILE ATTEMPTING TO BUILD: ${e.message}`);
        process.exit(1)
    }
}


runBuild()