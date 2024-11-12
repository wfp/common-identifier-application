# Common Identifier Application

The purpose of this Common Identifier application is to generate pseudonomous hashed identifiers for individuals, either directly from unique ID numbers or using biographic data. 

## Usage

There are three ways to "use" this application:
1. [INTENDED USAGE] Desktop UI
   - Users can install the ElectronJS application on Windows and submit their intended assistance files for processing.
   - The application will validate the input data against validation rules defined within a separate configuration file.
   - Once validated, relevant fsields in the dataset are processed according to the specific algorithm implementation.
2. Programmatically, with file-based data
   - It is possible to use purely the backend of this application (without the UI), while maintaining all of the built-in features, by calling the `preprocessFile` and `processFile` functions with file-based data respectively.
   - Currently only CSV and XLSX data formats are supported; an example of this approach is provided in the [Standalone Repo](https://dev.azure.com/worldfoodprogramme/SYR-BB-PREPROCESSING-APP/_git/SYR-BB-PREPROCESSING-STANDALONE).
3. Programmatically, with array-based data
   - Implement solely the algorithm class and provide it with data directly.
   - If using this approach, it is recommended to also implement the data validation checks and error handling.

## Data Processing Pipeline (file-based data)

### Configuration

- The `src/main/algo-shared/config/ConfigStore` ConfigStore attempts to load the configuration from the appllication directory or the backup location (app bundle) if the primary configuration fails to load. It also handles updating the user configuration file on config changes.

- The terms and conditions are also handled by the ConfigStore using the `src/main/algo-shared/config/appConfig` application config save/write process

### Pre-processing (validation)

- The `src/main/algo-shared/decoding` Decoders (CSV and XLSX) read the source file and convert it (using the `config.source` setup) to a Document with Sheets containing the input data with column aliases renamed

- The `src/processing` pre-processing function identifies if the target is a mapping document based on the current configuration and the data in the file and sets up validation accordingly

- The `src/main/algo-shared/validation` Validators are setup based on the active configuration, and ran against the Document.

- If there are errors, the `src/main/algo-shared/encoding` Encoders (CSV and XLSX) write the validation error output based on `[destination_errors]` section of the active configuration

- The frontend shows the results and either allows processing or shows the errors

### Processing

- The `src/main/algo-shared/decoding` Decoders (CSV and XLSX) read the source file and convert it (using the `config.source` setup) to a Document with Sheets containing the input data with column aliases renamed

- The `src/processing` processing function identifies if the target is a mapping document based on the current configuration and the data in the file. Using the active configuration it collects data into `static` `to_translate` and `reference` buckets per-row and passes it to the active algorithm for processing

- The active algorithm takes the `{ static:[...], to_translate:[...], reference: [...] }` per-row data and returns a map with the columns it wants to add -- ex: `{ USCADI: "....", DOCUMENT_HASH: "..." }`

- The data returned by the algorithm is merged into the source rows so the encoders can package multiple different outputs

- The `src/main/algo-shared/encoding` Encoders (CSV and XLSX) write the output based on the relevant `[destination]` / `[destination_map]` section of the active configuration.


## Development Instruction

### Defining a Configuration File

See [Configuration Files](./Configuration%20Files.md)

### Activating an Algorithm

To activate an algorithm for development / building with that algorithm use the `tools/activate-algo.js` scripts -- it copies the backup config file to the application's location and points the `src/main/active_algorithm.js` file to the right algorithm.

```
# for NWS
node tools/activate-algo.js algo-uscadi

# or for GOS
node tools/activate-algo.js algo-gos
```

Each algorithm repository contains `config` subdirectory which houses a `config.backup.toml` which serves as the backup (and baseline) configuration for the application built.


### Writing Your Own Algorithm Implementation

In the context of this application, this is the simplest possible hasher:

```ts
import { BaseHasher, makeHasherFunction } from '../algo-shared/hashing/base.js';
import type { Config } from '../algo-shared/config/Config.js';
import type { Validation } from '../algo-shared/validation/Validation.js';

class MyAlgorithmHasher extends BaseHasher {
    constructor(config: Config.Options["algorithm"]) {
        super(config);
    }

    generateHashForObject = (obj: Validation.Data["row"]) {
        // generate what ever you need here and return
        return {}
    }
}
```

Within the main application, the return value from `generateHashForObject` is included in the output file provided a corresponding header key is include in the configuration file.

To expose this hasher class to the wider application, you also need to define and export a `makeHasher` factory function:
```ts
export const makeHasher: makeHasherFunction = (config: Config.Options["algorithm"]) => {
    // some validation checks here
    return new MyAlgorithmHasher(config);
}
```
