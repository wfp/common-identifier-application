# Application Packaging

## Signing and building the installer

Azure Trusted Signing and `electron-winstaller` do not play well together.

Electron-Winstaller ships with (and always seem to use) an outdated version of
`signtool.exe` which does not support Trusted Signing nor the `/debug` switch.
This causes a number of issues when the Squirrel installer build wants to sign
the executables to be packaged.

We can avoid some of the issues by building the app, sigining all the executables and building the installer from the signed executables.

Triggering an `electron-forge make` always re-packages the application files (and removes any signing), so the Azure pipeline first does an `electron-forge package` , signs the binaries and runs `build-windows-installer.js` to build the output installer.

The main problem with this approach is that Squirrel adds two extra executables (`StubExecutable` which'll be renamed to the app executable name, and act as a launcher + `Updater.exe` which will handle updates), but also modifies them, so we cannot previously sign them, and will be added to the installer unsigned.

## Installation and shortcuts

The current implementation uses the code in `src/main/squirell-callbacks.js` to
handle Squirrel Application Lifecycle events and create / update application
(desktop) shortcuts.

On install (or update) the `--squirrel-install` (or `--squirrel-updated`) command
line switch is passed to the application, and are the desktop shortcuts are added.

The `--squirrel-uninstall` switch is passed on uninstall, when we delete the desktop shortcut.

If the code sigining of the application allows signing the `StubExecutable.exe`
(launcher) and the `Updater.exe` executables as part of the Squirrel build process,
the event handling block:

```
const handleSquirrelEvent = require('./squirell-callbacks');

// INITIAL SQUIRELL EVENT HANDLING
// -------------------------------



// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}
```

can be replaced with a simple call to `electron-squirell-startup` that uses the
`Updater.exe` executable to create, remove and update the shortcuts.

```

if(require('electron-squirrel-startup')) return;
```

## Self-extracting installers

The self-extracting installers built by the pipeline use the [7zsfxmm](https://github.com/chrislake/7zsfxmm) SFX module.

You can change the configuration by changing the generated configuration in `azure-pipelines.yml`:

```
;!@Install@!UTF-8!
Title="CommonID Tool $(regionName)"
BeginPrompt="Do you want to install this application?"
HelpText="This will install the application"
RunProgram="commonid-tool.exe"
GUIFlags="64"
InstallPath="%LOCALAPPDATA%\Common ID Tool $(regionName)"
;!@InstallEnd@!
```

Source and published package of the `7zsd.sfx` used (and some example configurations):
https://github.com/chrislake/7zsfxmm

Documentation of the configuration parameters is available at:
https://github.com/OlegScherbakov/7zSFX/blob/master/docs/parameters.html

NOTE: 7zsfxmm cannot handle LZMA2 archives, only LZMA -- use `-m0=lzma` when compressing the archive with 7zip.

### Building a signed app for MacOS

The `forge.config.js` file contains the following (commented out) snippet:

```js
// ....
packagerConfig: {
  // CODE SIGNING THINGS GO HERE
  // ---------------------------
  // enable this to create signed executables on macOS
  // XCode and the developer account must be set up to sign executables --
  // more on setting this up:
  // https://github.com/electron/osx-sign
  // object must exist even if empty
  // osxSign: {}
  // END OF CODE SIGNING THINGS
  // --------------------------
  // ....
}
```

By uncommenting the `osxSign: {}` line, the MacOS build will use XCode (and the developer account associated with it) to sign the executable. For more information, check [the electron osx-sign documentation](https://github.com/electron/osx-sign)

#### Prerequisites

- must be a registered member of the Apple Developer Program. Please note that you could be charged by Apple in order to get issued with the required certificates.

- must have Xcode installed from the Mac App Store. It is not recommended to download your copy from other 3rd party sources for security reasons.

- must have Xcode Comma
