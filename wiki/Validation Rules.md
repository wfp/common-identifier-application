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

- `+1d:+10d` means 'at most 1 day after today' AND 'at most 10 day after today'
- `-5d:+10d` means 'at most 5 days before today' AND 'at most 10 days after today'
- `+1M:+10d` means 'at most 1 month after today' AND 'at most 10 days after today' (dates are sorted into ascending order)
- `-10M:+10d` means 'at most 10 months before today' AND 'at most 10 days after today'
- `+1Y:+10d` means 'at most 1 year after today' AND 'at most 10 days after today' (dates are sorted into ascending order)
- `-2Y:+10d` means 'at most 2 years before today' AND 'at most 10 days after today'

Example:

```toml
{ op = "date_diff", value = "-1d:12M"},
{ op = "date_diff", value = "+2M:3M"},
{ op = "date_diff", value = "-2Y:-1Y"}
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

There is a special case for max value, whereby a date can be passed in as a maximum. This is to support date of birth entry without requiring complex date parsing:
```toml
{ op = "max_value", value = "{{currentYear}}" },
{ op = "max_value", value = "{{currentMonth}}" },
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
