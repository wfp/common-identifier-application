# WIP

# Running the unit tests

Unit tests for the algorithm (shared and algorithm-specific) are written using the JEST test framework. Run the test suite:

(the `--experimental-vm-modules` node option is required to load the ES module code for the frontend tests)


```bash
# the `--experimental-vm-modules` node option is required to load the ES module code
# for the frontend tests
export NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules"

# Now both backend and frontend tests can be ran
npx jest
```

Or get the test coverage using

```bash
npx jest --coverage
```


# Development logging

The application uses the `debug` package to do logging. To log every CommonID-related message to set the environment variable `DEBUG` to `CID:*`.

For example to run the application for development with every CommonID component logging to the console:

```
DEBUG=CID:* npm start
```


All logging lines are prefixed with `CID:` (for CommonID), and should look like the following:

```
  CID:loadConfig CONFIG HASH: 3b4b6ab8a68202ebcf3221d5c1a728b7 +33ms
  CID:loadSaltFile Attempting to load salt file from  /Users/.../Library/Preferences/BuildingBlocks/WFP SYR NWS stage (BE85CAE8) – Public.asc +0ms
  CID:loadSaltFile SALT FILE looks OK +1ms
  CID:ConfigStore Backup config validation success - using it as config +34ms
```

To see only specific log lines refine the `CID:*` pattern.

# Installer

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


## Some basic dev tasks

### Activating an algorithm for use

To set which algorithm is used by the app the command-line tool `tools/activate-algo.js` can be used:

```
$ node tools/activate-algo.js algo-gos

Activating algoirhtm: algo-gos
Generating ****/src/main/active_algorithm.js
Copying backup config from ****/src/main/algo-gos/config/config.backup.toml
                        to ****/src/main/config.backup.toml


$ node tools/activate-algo.js algo-uscadi

Activating algoirhtm: algo-uscadi
Generating ****/src/main/active_algorithm.js
Copying backup config from ****/src/main/algo-uscadi/config/config.backup.toml
                        to ****/src/main/config.backup.toml
```


This generates a new `src/main/active_algorithm.js` which is a re-export of the selected algorithm's `index.js` and copies the backup configuration to `src/main/config.backup.toml`.

Manually doing these steps also activates the algorithm.

### Generating a config signature hash

To generate the config signature for the config file the tool `tools/config-signature.js` can be used:

```
$ node tools/config-signature.js src/main/algo-uscadi/config/config.backup.toml

Opening file:  src/main/algo-uscadi/config/config.backup.toml
HASH: 9000d0f670be5287bc86bc1b74b48d34
```

This returns the signature hash that can be embedded in the config file.


### Building a signed app for Windows

The `forge.config.js` file contains the following (commented out) snippet:

```js
  makers: [
    // ....
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // CODE SIGNING THINGS GO HERE
        // ---------------------------

        // certificateFile: './cert.pfx',
        // certificatePassword: process.env.CERTIFICATE_PASSWORD

        // END OF CODE SIGNING THINGS
        // --------------------------
      },
    },
    // ....
```

By uncommenting these lines, setting the certificate file path and the password environment variables the Windows builds will be signed ([Visual Studio's SignTool](https://learn.microsoft.com/en-us/dotnet/framework/tools/signtool-exe) is used, so at least the free Community edition of Visual Studio is needed)

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

- must have Xcode Command Line Tools installed. To check whether it is available, try `xcode-select --install` and follow the instructions.




# IN THE CURRENT STATE INFORMATION BELLOW MAY OR MAY NOT BE ACCURATE

SYMLINKING IS CURRENTLY NOT NEEDED (IT WILL MAKE A COMEBACK AFTER REPO RE-SEPARATION)

# Setting up the current development environment

Until the repository separation and build system is completed there are a number
of manual steps that need to be done to get this repository working on your machine.


#### Step 0: Clone & init this repo

```
git clone ....
npm install
```

#### Step 1: Clone the Algorithm repository to a separate location

#### Step 2: Symlink the Algorithm repository into `src/main/ALGO-NWS`

(the path name, just like these build steps is only temporary)

```
# In this repo's directory
ln -s <FULL PATH TO ALGO REPO> ./src/main/ALGO-NWS
```


#### Step 3: Build the UI

```
# In the src/renderer directory
npm install
npm run build
```

this'll output the compiled UI files into the `dist` directory.


#### Step 4: Start the application

```
npm start
```


## Generating configuration file signatures


Use the script `tools/config-signature.js` in the algorithm repostiory to generate a signature for a configuration file:

```
node tools/config-signature.js config.toml
Opening file:  config.toml
HASH: f3634ad11b145368af2ea19087921f5a
```

This signature can be copy-pasted into the `signature.config_signature` value in the config file (the signature is generated by ignoring the `signature` key)



# SheetJS vulnerabilities

The SheetJS / node-xlsx library used in the application is sourced from the SheetJS repository -- current versions of this library are published on the SheetJS repository.

Further details about this can be found in the SheetJS documentation.
https://docs.sheetjs.com/docs/getting-started/installation/nodejs/