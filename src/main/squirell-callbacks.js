const os = require('os');
const fs = require('fs');
const path = require('path');
const activeAlgorithm = require('./active_algorithm')
const { app } = require('electron/main')
const { shell } = require('electron')

// The name of the shortcut as created on the Desktop
const SHORTCUT_FILE_NAME = `Building Blocks Common ID Tool ${activeAlgorithm.REGION}`;

const SHORTCUT_DESCRIPTION = 'Common Identifier generation tool for Assistance and Mapping documents.'

function desktopPath(...subPaths) {
    const desktopDir = path.join(app.getPath('desktop'), ...subPaths);
    return desktopDir;
}


// Attempts to create a desktop shortcut
function createDesktopShortcut() {

    if (process.platform !== 'win32') {
        return;
    }

    const shortcutFullPath = desktopPath( `${SHORTCUT_FILE_NAME}.lnk`);
    const exePath = process.execPath;
    const appFolder = path.resolve(process.execPath, '..');


    console.log("Attempting to create shortcut:", shortcutFullPath);

    const success = shell.writeShortcutLink(
        shortcutFullPath,
        // create should update the shortcut if already present
        'create',
        {
            target: exePath,
            cwd: appFolder,
            description: SHORTCUT_DESCRIPTION,
        }
    )

    console.log("Shortcut creation success: ", success ? "YES" : "NO");

    return success;
}

// Handles incoming Application Lifecycle events from Squirrel
function handleSquirrelEvent() {

    // no arg means this is not for us
    if (process.argv.length === 1) {
      return false;
    }


    const shortcutFullPath = desktopPath( `${SHORTCUT_FILE_NAME}.lnk`);


    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        console.log("App update event triggered -- updating shortcut")

        createDesktopShortcut();
        setTimeout(app.quit, 1000);
        return true;

      case '--squirrel-uninstall':
        console.log("App uninstall event triggered -- removing shortcut")
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers

        try {
            // Delete the shortcut file
            fs.unlinkSync(shortcutFullPath);
        } catch (err) {
            // this delete operation should never fail (file presence or access problems)
            console.log('Unable to delete shortcut -- shortcut not present', err);
        }


        setTimeout(app.quit, 1000);
        return true;

      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        app.quit();
        return true;
    }
}


module.exports = { handleSquirrelEvent, createDesktopShortcut };