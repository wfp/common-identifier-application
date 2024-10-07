const os = require('os');
const fs = require('fs');
const path = require('path');
const activeAlgorithm = require('./active_algorithm')
const { shell } = require('electron')

// The name of the shortcut as created on the Desktop
const SHORTCUT_FILE_NAME = `Building Blocks Common ID Tool ${activeAlgorithm.REGION}`;

const SHORTCUT_DESCRIPTION = 'Common Identifier generation tool for Assistance and Mapping documents.'

function desktopPath(...subPaths) {
    const homeDir = os.homedir(); // See: https://www.npmjs.com/package/os
    const desktopDir = path.join(homeDir, 'Desktop', ...subPaths);
    return desktopDir;
}

// Handles incoming Application Lifecycle events from Squirell
function handleSquirrelEvent() {

    // no arg means this is not for us
    if (process.argv.length === 1) {
      return false;
    }


    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    // const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
    const exePath = process.execPath;


    const shortcutFullPath = desktopPath( `${SHORTCUT_FILE_NAME}.lnk`);


    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        console.log("App update event triggered -- updating shortcut")

        shell.writeShortcutLink(
            shortcutFullPath,
            // create should update the shortcut if already present
            'create',
            {
                target: exePath,
                cwd: appFolder,
                description: SHORTCUT_DESCRIPTION,
            }
        )
        return true;

      case '--squirrel-uninstall':
        console.log("App uninstall event triggered -- removing shortcut")
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers

        fs.unlinkSync(shortcutFullPath);


        return true;

      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        app.quit();
        return true;
    }
}


module.exports = handleSquirrelEvent;