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


## Self-extracting installers


The self-extracting installers built by the pipeline use the [7zsfxmm](https://github.com/chrislake/7zsfxmm) SFX module.

You can change the configuration by changing the generated configuration in `azure-pipelines.yml`:

```
;!@Install@!UTF-8!
Title="Building blocks CommonID Tool $(regionName)"
BeginPrompt="Do you want to install this application?"
HelpText="This will install the application"
RunProgram="commonid-tool.exe"
GUIFlags="64"
InstallPath="%LOCALAPPDATA%\Building Blocks Common ID Tool $(regionName)"
;!@InstallEnd@!
```

Source and published package of the `7zsd.sfx` used (and some example configurations):
https://github.com/chrislake/7zsfxmm

Documentation of the configuration parameters is available at:
https://github.com/OlegScherbakov/7zSFX/blob/master/docs/parameters.html

NOTE: 7zsfxmm cannot handle LZMA2 archives, only LZMA -- use `-m0=lzma` when compressing the archive with 7zip.

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



### Setting up for development

#### Step 1: Clone & init this repo and the algorithm repositories

```
git clone ....
git submodule init
git submodule update
npm install
```


#### Step 2: Build the UI

```
# In the src/renderer directory
npm install
npm run build
```

this'll output the compiled UI files into the `dist` directory.


#### Step 4: Start the application

```
DEBUG=CID:* npm start
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

# Processing pipeline overview

The processing uses the following steps:

## Configuration

- The `src/main/algo-shared/config/ConfigStore` ConfigStore attempts to load the configuration from the appllication directory or the backup location (app bundle) if the primary configuration fails to load. It also handles updating the user configuration file on config changes.

- The terms and conditions are also handled by the ConfigStore using the `src/main/algo-shared/config/appConfig` application config save/write process

## Pre-processing (validation)

- The `src/main/algo-shared/decoding` Decoders (CSV and XLSX) read the source file and convert it (using the `config.source` setup) to a Document with Sheets containing the input data with column aliases renamed

- The `src/processing` pre-processing function identifies if the target is a mapping document based on the current configuration and the data in the file and sets up validation accordingly

- The `src/main/algo-shared/validation` Validators are setup based on the active configuration, and ran against the Document.

- If there are errors, the `src/main/algo-shared/encoding` Encoders (CSV and XLSX) write the validation error output based on `[destination_errors]` section of the active configuration

- The frontend shows the results and either allows processing or shows the errors

## Processing

- The `src/main/algo-shared/decoding` Decoders (CSV and XLSX) read the source file and convert it (using the `config.source` setup) to a Document with Sheets containing the input data with column aliases renamed

- The `src/processing` processing function identifies if the target is a mapping document based on the current configuration and the data in the file. Using the active configuration it collects data into `static` `to_translate` and `reference` buckets per-row and passes it to the active algorithm for processing

- The active algorithm takes the `{ static:[...], to_translate:[...], reference: [...] }` per-row data and returns a map with the columns it wants to add -- ex: `{ USCADI: "....", DOCUMENT_HASH: "..." }`

- The data returned by the algorithm is merged into the source rows so the encoders can package multiple different outputs

- The `src/main/algo-shared/encoding` Encoders (CSV and XLSX) write the output based on the relevant `[destination]` / `[destination_map]` section of the active configuration.


# Algorithm activation & backup configuration files

To activate an algorithm for development / building with that algorithm use the `tools/activate-algo.js` scripts -- it copies the backup config file to the application's location and points the `src/main/active_algorithm.js` file to the right algorithm.

```
# for NWS
node tools/activate-algo.js algo-uscadi

# or for GOS
node tools/activate-algo.js algo-gos
```

Each algorithm reposiutory contains  `config` subdirectory which houses a `config.backup.toml` which serves as the backup (and baseline) configuration for the application built.


# Validator configuration

## Setting up validators

The validators are set up in the `[validations]` section of the configuration file on a per-column basis. The `*` column can be used to apply a validator to every column.

```toml
[validations]

"*" = [
    { op = "max_field_length", value = 200 },
]

# validators for the column with the alias `individual_reference`
individual_reference = [
    { op = "field_type", value = "str" },
    { op = "regex_match", value = "[a-zA-Z0-9!\"#$%&'()*+\\-./:;?@[\\]^_{|}~]+", message="must only consist of alphanumeric characters and supported special characters" }
]

```

## Validator types

```toml
{
  op = "<VALIDATOR TYPE>"
  value = ... # <MAIN VALIDATOR PARAMETER>
  message="<OPTIONAL MESSAGE>"
  ...
}
```

- The type of the validator is indicated by the `op` of the validator.

- Most Validators take their "main argument" as the `value`.

- The validation error message can be customised by setting `message`.

Each validator type is implemented as in `src/main/algo-shared/validation`.

### Date difference from today

```toml
{ op = "date_diff", value = "<DATE OFFSET>" }
```

Expects the value of the column to be a date and to be before / after `<NOW> + <DATE_OFFSET>`.

Date offset takes the format of: `<POSITIVE OR NEGATIVE INTEGER><RANGE TYPE>`. Some examples:

- `+1d` means 'at most 1 day after today'
- `-5d` means 'at most 5 days before today'
- `+1M` means 'at most 1 month after today'
- `-10M` means 'at most 10 months before today'
- `+1Y` means 'at most 1 year after today'
- `-2Y` means 'at most 2 years before today'

Example:

```toml
{ op = "date_diff", value = "-1d"},
{ op = "date_diff", value = "+2M"},
{ op = "date_diff", value = "-2Y"}
```

### Date difference between columns

```toml
{ op = "date_field_diff", target = "<TARGET COLUMN>", value = "<DATE OFFSET>" }
```

Expects the value of the column specified by `<TARGET COLUMN>` to be a valid date, the value of the current column to be a valid date and to be before / after `<TARGET COLUMN VALUE> + <DATE_OFFSET>`.

The date offset format is shared with `date_diff`.


Example:

```toml
end = [
  { op = "date_field_diff", target = "start", value="-12M", message="must be within a year of Start"},
]
```

### Column type

```toml
{ op = "field_type", value = "<TYPE>" },
```

Expects the value of the column to be of the type specified by `<TYPE>`:

- `str` for string / text
- `num` for numbers

Example:

```toml
{ op = "field_type", value = "str" },
```


### Language check

```toml
{ op = "language_check", value = "<LANGUAGE>" }
```

Expects the value of the column to have only characters used by the given language.

Currently only the `Arabic` language is supported.

Example:

```toml
{ op = "language_check", value = "Arabic", message="is not Arabic"}
```

### Minimum / maximum length

```toml
{ op = "min_field_length", value = "<A NUMBER>" },
{ op = "max_field_length", value = "<A NUMBER>" },
```

Expects the length of the value (as a string) of the column to be:
- at least `value` (in case of `min_field_length`)
- at most `value` (in case of `max_field_length`)

Example:

```toml
{ op = "min_field_length", value = 2 },
{ op = "max_field_length", value = 15 },
```

### Minimum / maximum value

```toml
{ op = "min_value", value = "<A NUMBER>" },
{ op = "max_value", value = "<A NUMBER>" },
```

Expects the numerical value of the column to be:
- at least `value` (in case of `min_value`)
- at most `value` (in case of `max_value`)

Example:

```toml
{ op = "min_value", value = 1 },
{ op = "max_value", value = 1000 },
```



### Options

```toml
{ op = "options", value = [ "<AN>", "<ARRAY>", "<OF>", "<OPTIONS>" ] }
```

Expects the value of the column to be one of the values in the `value` string array.

Example:

```toml
{ op = "options", value = [ "", "NATIONAL_ID", "PERSONAL_ID", "LOCAL_COUNCIL_CARD" ] }
```

### Regexp

```toml
{ op = "regex_match", value = "<REGULAR EXPRESSION>" }
```

Expects the value of the column to match the regular expression. It is highly recommended to supply a custom error message here, as the users will need more context then just a regular expression.

NOTE: this validator attempts to match the whole string, not just a substring

Example:

```toml
{ op = "regex_match", value = "[a-zA-Z0-9!\"#$%&'()*+\\-./:;?@[\\]^_{|}~]+", message="must only consist of alphanumeric characters and supported special characters" } # TBD
```

### Same value for all rows

```toml
{ op = "same_value_for_all_rows" },
```

Expects the value of the column to equal the value of the column in the first row (thereby requiring the whole document to contain only a single value for this column).

Example:

```toml
{ op = "same_value_for_all_rows" },
```
