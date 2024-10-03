const electronInstaller = require('electron-winstaller');
const fs = require('node:fs')
const path = require('node:path')

const INPUT_DIRECTORY = path.join(__dirname, "out", "commonid-tool-win32-x64")
const OUTPUT_DIRECTORY = path.join(__dirname, "out", "installer-win32-x64")

const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"))


function findFirstDirectoryMatchingPattern(baseDir, rxPattern) {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .filter(d => rxPattern.test(d.name))


    if (dirs.length === 0) {
        throw new Error(`Unable to find any directory in '${baseDir}' matching the pattern /${rxPattern}/`)
    }

    return dirs[0].name;
}


function buildSignToolCommand(basePath='') {

    function getSigntoolPath() {
        const baseDir = path.join('Users', 'VssAdministrator', 'AppData', 'Local', 'TrustedSigning', 'Microsoft.Windows.SDK.BuildTools')
        const fullBasePath = `${basePath}${baseDir}`;

        const sdkDir = path.join( fullBasePath, findFirstDirectoryMatchingPattern(fullBasePath, /Microsoft\.Windows\.SDK\.BuildTools/));
        const sdkBinDir = path.join( sdkDir, findFirstDirectoryMatchingPattern(path.join(sdkDir, 'bin'), /^[0-9\.]{4,}$/), 'x64' )

        const signToolPath = path.join(sdkBinDir, 'signtool.exe');
        return signToolPath;
    }


    function getTrustedSigningClientBinDir() {

        const baseDir = path.join('Users', 'VssAdministrator', 'AppData', 'Local', 'TrustedSigning', 'Microsoft.Trusted.Signing.Client')
        const fullBasePath = `${basePath}${baseDir}`;
        const binDir = path.join( fullBasePath, findFirstDirectoryMatchingPattern(fullBasePath, /Microsoft\.Trusted\.Signing\.Client/), 'bin', 'x64');
        return binDir;
    }

    // C:\Users\VssAdministrator\AppData\Local\TrustedSigning\Microsoft.Trusted.Signing.Client\Microsoft.Trusted.Signing.Client.1.0.53\bin\x64\Azure.CodeSigning.Dlib.dll

    const binDir = getTrustedSigningClientBinDir()

    const commandLine = [
        "/v",
        "/debug",
        "/fd SHA256",
        "/tr http://timestamp.acs.microsoft.com",
        "/td SHA256",
        `/dlib "${path.join(binDir, 'Azure.CodeSigning.Dlib.dll')}"`,
        `/dmdf "${path.join(binDir, 'metadata.json')}"`,
    ];

    return {
        signToolPath: getSigntoolPath(),
        signWithParams: commandLine.join('  ')
    };
}





async function runBuild() {




    if (process.argv.length < 3) {
        console.error("Usage: node build-windows-installer <REGION>");
        process.exit(-1);
    }

    const region = process.argv[2];


    const appName = PACKAGE_JSON.name;
    const appVersion = PACKAGE_JSON.version;

    try {
        // INSTALLER CONFIGURATION
        // =======================

        const fullAppName = `${appName}-${region}`;
        const windowsSignOpts = buildSignToolCommand(process.platform == 'darwin' ? '/tmp/' : 'C:\\'),
        const buildOptions = {
            appDirectory: INPUT_DIRECTORY,
            outputDirectory: OUTPUT_DIRECTORY,

            name: fullAppName,
            title: fullAppName,
            noMsi: true,
            exe: `${appName}.exe`,


            // override the loading gif
            loadingGif: path.join(__dirname, "assets","installing_animation.gif"),

            // Version and description should come from package.json in the build `app.asar`

            setupExe: `${appName}-${region}-${appVersion} Setup.exe`,

            signWithParams: windowsSignOpts.signWithParams
            // windowsSign: windowsSignOpts,
        };


        // Build the installer

        console.log("Starting installer build with options: ", buildOptions);

        await electronInstaller.createWindowsInstaller(buildOptions);
        console.log("DONE")

    } catch (e) {
        console.error(`ERROR WHILE ATTEMPTING TO BUILD: ${e.message}`);
        console.error(e.stack)
        process.exit(1)
    }
}


runBuild()