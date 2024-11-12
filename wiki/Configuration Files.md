# Configuration Files

Configuration files in the common ID application are used to define the input schemas, validation rules, algorithm specifications, and output formats of intended assistance files. These are defined as `toml` files and must be included within any algorithm implementation at the path `src/main/<algo-dir>/config/config.backup.toml` if using the UI component.

[[__TOC__]]

## Schema

Look in any of the existing algorithm implementation repositories for examples of specific config usages.

### Meta

```toml
[meta]
region="ABC"    # application installations are region dependent, the value specified here MUST match the built-in region.
version="1.0.0" # the version information is shown in the top-right of the desktop UI for user visibility.
```

### Messages

> [!IMPORTANT]
> If you are intending on using the UI component of this application, the messages section in the configuration file is NOT optional. The values for `terms_and_conditions`, `error_in_config`, and `error_in_salt` MUST be defined.

Messages are an optional field used to set the default error and terms & conditions messages within the UI application. Each of these fields supports `HTML` tag syntax.

```toml
[messages]
# terms and conditions are shown to the user on first start and upon configuration file changes.
terms_and_conditions="""
    <h3>My Fantastic Application</h3>
    <p>T&C's go here...</p>
"""
# the generic error message to display when an error is encountered with the configuration file itself.
error_in_config=""
# the generic error message to display when the salt file cannot be read or is malformed.
error_in_salt=""
```

### Source

The `source` sections defines the expected input columns in the source dataset. The `name` key is the human readable name in the header of the CSV file, `alias` is the more machine-friendly name used by the application internally, and `default` is the default value to use for empty cells where necessary.

> TODO: make `alias` an optional parameter - it is not relevant for programmatic usage.

```toml
[source]
# an array of column names, their aliases, and default values where necessary.
columns = [
    { name = "Column A", alias = "col_a" },
    { name = "Column B", alias = "col_b", default = "<default_value>" },
    [...]
]
```

### Validations

This file section details which validation rules to apply to which columns in the input file.

```toml
[validations]
# per column name to apply validation rules to, define an array of validation rules
column_name = [
    { op = "max_value", value = 10 }
]
# "*" can be used as column name to refer to all columns in the input file
"*" = [
    { op = "field_type", value = "string" }
]
```
```toml
# the structure of a validation rule is as follows:
{
    # the name of the validation rule, from the supported list.
    op = "<validation_rule>",
    # [optional] the argument to provide to that validation rule
    value = "<validation_argument>",
    # [optional] for comparative / cross-column validation rules, provide a target column to validate with.
    target = "<target_column>"
    # [optional] a custom error message, overriding the rule default, to display in the output file.
    message = "<custom_error_message>",
}
```

This is the list of currently supported validation rules, these are further described in the [Validation rules wiki page](./Validation%20Rules.md).

| Validation Rule Name (op) | Argument                | Target | Description                                    |
|---------------------------|-------------------------|--------|------------------------------------------------|
| options                   | Array<string \| number> | ❌     | Is value in the argument array?                |
| regex_match               | string                  | ❌     | Does value match provided regex?               |
| field_type                | "string" \| "number"    | ❌     | Is value type only the specified value?        |
| language_check            | string                  | ❌     | Is the value in the correct language?          |
| max_field_length          | number                  | ❌     | Maximum number of characters                   |
| min_field_length          | number                  | ❌     | Minimum number of characters                   |
| max_value                 | number \| string        | ❌     | Is value less than argument?                   |
| min_value                 | number                  | ❌     | Is value more than argument?                   |
| date_diff                 | string                  | ❌     | Is value within the specified date range?      |
| date_field_diff           | string                  | ✅     | Is value within the date of another column?    |
| linked_field              | string                  | ✅     | Link two columns together and ensure not blank.|
| same_value_for_all_rows   | ❌                      | ❌    | Entire column must be the same value.          |

### Algorithm

```toml
[algorithm]
# the aliased columns to use as part of the algo implementation.
[algorithm.columns]
# list of aliased column names to be translated as part of the algorithm implementation
to_translate = [ "col_a" ]
# list of aliased column names that remain static but are included in the output hash
static = [ "col_b" ]
# list of aliased column names that are used to calculate the corresponding reference identifier
reference = [ "col_c" ]
```

```toml
[algorithm.hash]
# the hashing algorithm to use, currently only SHA256 is supported
strategy = "SHA256"

[algorithm.salt]
# should the salt value be pulled from a file or a static value - options are "FILE" or "STRING"
source = "FILE"
# a compilable regex string to validate that the salt is valid     
validator_regex = ".*"

# the actual value to use for the salt
#  - If "FILE" is specified as the source, this must be a map of `win32` and `darwin` to respective file paths.
#        - The keyword $APPDATA can be used to refer to the OS's app data location
#        - The keyword $HOME can be used to refer to the users home directory.
#
#  - If "STRING" is specified, this can simply be a string value:
# value = "<salt value here>"
[algorithm.salt.value]
win32  = "$APPDATA/<path_to_file>/file.asc"
darwin = "$APPDATA/<path_to_file>/file.asc"
```

### Destination

Define the columns to include in the output file, including the human-readable names to convert to where necessary.

```toml
[destination]
# array of column names and aliases to include in the output file
columns = [
    { name = "Column A", alias = "col_a" },
    { name = "Column B", alias = "col_b" },
    [...]
]
# suffix that is appended to the output filename -> <input_file_name><postfix>.csv
# for XLSX, this is also the name of the sheet containing the final data
postfix = "_OUTPUT"
```

### Destination Map

Define the columns to include in the output mapping file, including the human-readable names to convert to where necessary.

```toml
[destination_map]
# array of column names and aliases to include in the output mapping file
columns = [
    { name = "Column A", alias = "col_a" },
    { name = "Column B", alias = "col_b" },
    [...]
]
# suffix that is appended to the output mapping filename -> <input_file_name><postfix>.csv
# for XLSX, this is also the name of the sheet containing the final data
postfix = "_OUTPUT_MAPPING"
```

### Destination Errors

Define the columns to include in the error report, including the human-readable names to convert to where necessary.

> [!IMPORTANT]
> Make sure to include the `Errors | errors` column in the output configuration, otherwise they will not be included in the output file.

```toml
[destination_errors]
# array of column names and aliases to include in the errors file
columns = [
    { name = "Errors", alias = "errors" },
    { name = "Column A", alias = "col_a" },
    { name = "Column B", alias = "col_b" },
    [...]
]
# suffix that is appended to the errors filename -> <input_file_name><postfix>.csv
# for XLSX, this is also the name of the sheet containing the final data
postfix = "_ERRORS"
```


### Config Signature

The config signature is the calculated `md5` hash value of the configuration file itself, computed using the `tools/config-signature.js` utility during pipeline execution. This feature exists to reduce the liklihood of accidental changes to the config file causing issues in the deterministic processing of input data.

When a change is made to the configuration file, a new signature value must be created to reflect its new content.

> TODO: git precommit hook to validate the config file on commit and throw an error if values don't match.

```toml
[signature]
# DO NOT EDIT MANUALLY
config_signature = "aaabbb"
```
