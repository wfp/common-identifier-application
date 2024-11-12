Description of tool

## Key Features

### hashing
Hashing is a cryptographic process that transforms input data of any size into a fixed-size string of characters, typically a sequence of numbers and letters, known as a hash value or hash code. This operation is secure because it is designed to be a one-way function, meaning that it is computationally infeasible to reverse the process and retrieve the original input from the hash. Additionally, even a small change in the input data results in a significantly different hash, making it highly sensitive to alterations. Hashing is widely used in various applications, including data integrity verification, password storage, and digital signatures, as it ensures that sensitive information remains protected and unaltered.

The Building Blocks Common Identifier application uses SHA256, which is an industry standard hashing implementation, used everywhere from securing internet connectivity to banking. It also implements a salting process whereby an additional set of characters is included into the original input before hashing; this increases the level of randomness in the algorithm, making it more difficult to reverse engineer. For this purpose, the Building Blocks GPG public key is used as the salt value.

In GOS, users submit an intended assistance file to the desktop application, which includes the following fields:

- [National ID] The Syria National Id of the individual to be assisted.
- [Organization] The BB acronym of the organisation delivering the assistance.
- [Category] The assistance category.
- [Currency] The currency of the assistance (SYP in this case).
- [Amount] The amount of intended assistance.
- [Start (yyyyMMdd)] The assistance start date.
- [End (yyyyMMdd)] The assistance end date.

The application takes the National ID value in each row of the uploaded document, concatenates it with the salt value, and passes it through the SHA256 hashing algorithm to produce a pseudorandom string consisting of 56 characters. The same National ID provided as input results in the same hashed common identifier in the output.

In NWS, users submit an intended assistance file to the desktop application, which should include the following fields:

- [Individual Reference] A unique value referencing this individual internally to the organisation providing assistance.
- [First Name] The first name of the individal (in Arabic).
- [Last Name] The lasr name of the individal (in Arabic).
- [Father First Name] The first name of the individals father (in Arabic).
- [Mother First Name] The first name of the individals mother (in Arabic).
- [Year of Birth] The year of birth of the individual.
- [Document Type] An optional field specifying either Local Council Card, Personal Id, or National Id.
- [Document ID] An optional field specifying a Local Council Card, Personal Id, or National Id number.
- [Organization] The BB acronym of the organisation delivering the assistance.
- [Category] The assistance category.
- [Currency] The currency of the assistance (SYP in this case).
- [Amount] The amount of intended assistance.
- [Start (yyyyMMdd)] The assistance start date.
- [End (yyyyMMdd)] The assistance end date.

For each row of the uploaded document, the application uses the biographic fields (names and year of birth) to create a common identifier for the individual. The names are first transliterated into Latin characters and then passed through a phonetics algorithm, which produces a unique code based on how a human would physically say the name; this helps to standardise the output by removing the impact of spelling mistakes or malformed data. In parallel, the Arabic names are passed through a Soundex algorithm which performs a similar phonetics operation to produce a unique code, but this time purely based on Arabic characters.

Both of these codes are concatenated with the year of birth and the salt value, and passed through the SHA256 hasing algorithm to produce a pseudorandom string consisting of 56 characters. The same biographic data provided as input results in the same hashed common identifier in the output.

Working with purely biographic data is inherently difficult as it is reliant on human data entry and thus is subject to data quality issues. To decrease the likelihood of false-positive duplicated common identifiers, a user can also optionally specify Id numbers and Id type to produce a reference hash; this is not used in Building Blocks to make duplication decisions, but can be used referentially to increase the confidence in a decision post-factum. If Document ID and Document Type are provided in the input file, these are concatenated together and hashed using the same SHA256 algorithm to produce a 56 character reference identifier.

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
   - h

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
