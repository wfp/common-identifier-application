# WIP



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