// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*
 * THIS FILE CONTAINS FUNCTIONS RELATED TO THE VALIDATION AND PROCESSING OF MAPPING FILES.
 * A MAPPING FILE IS A REDUCED SET OF DATA COMPARED TO THE ORIGINAL INPUT FILE, DEFINED
 * WITHIN THE CONFIGURATION.
 * 
 * THIS IS COPIED DIRECTLY FROM THE SHARED ALGORITHM IMPLEMENTATION `src\processing\mapping.ts`
 * POLLUTING THE FRONTEND CODE WITH THE ENTIRE BACKEND ALGORITHM SETUP IS UNNECESSARY
 */

import Debug from 'debug';
import type { Config, CidDocument } from '../common/types';
const log = Debug('CID:renderer:util');

// Returns a list of columns containing both algorithm-required and "always-include" columns
// (effectively merging data from the two config sections of algorithm and columns).
// column returned if name present in any of the algorithm fields (to_translate, static, reference)
// column returned if name present in both source and destination column configs
export function mapRequiredColumns(
  configAlgo: Config.AlgorithmColumns,
  configSource: Config.ColumnMap,
  configDestination: Config.ColumnMap,
) {
  // build a list of columns that are used for the hashing (according to the configuration provided)
  // this can be used to figure out if an input document is an assistance document or a mapping document
  let algorithmColumns: string[];

  // TODO: probably need stronger schema checking than this...
  if (typeof configAlgo !== 'object') {
    log('Unable to find column configuration for algorithm.');
    algorithmColumns = [];
  } else {
    // concat the input columns from the config (or use an empty list as default)
    algorithmColumns = [
      ...(configAlgo.process || []),
      ...(configAlgo.static || []),
      ...(configAlgo.reference || []),
    ];
  }

  // build a list of columns that are present in both source and destination column configurations
  const sourceAliases = new Set(configSource.columns.map((c) => c.alias));
  const alwaysIncludeColumns = configDestination.columns
    .map((c) => c.alias)
    .filter((c) => sourceAliases.has(c));

  return Array.from(new Set([...algorithmColumns, ...alwaysIncludeColumns]));
}

// Returns true if the sheet is containing only the hash input columns
// in which case its a mapping-only sheet, and we need to treat it differently
export function isMappingOnlyDocument(
  configAlgo: Config.AlgorithmColumns,
  configSource: Config.ColumnMap,
  configDestination: Config.ColumnMap,
  document: CidDocument,
) {
  // returns true if two sets are equal
  const areSetsEqual = (xs: Set<string>, ys: Set<string>) =>
    xs.size === ys.size && [...xs].every((x) => ys.has(x));

  // build list of column names either in configConfig or BOTH configSource and configDestination
  const mappingDocumentColumns = mapRequiredColumns(configAlgo, configSource, configDestination);
  const documentColumns = document.data.length > 0 ? Object.keys(document.data[0]) : [];

  const isMappingDocument = areSetsEqual(new Set(mappingDocumentColumns), new Set(documentColumns));

  return isMappingDocument;
}

// Returns a new validator dictionary, keeps only the columns needed by the
// algorithm (so only columns relevant for mapping files are checked)
export function keepValidatorsForColumns(config: Config.FileConfiguration, validatorDict: { [key: string]: any[] }) {
  const keepColumnList = mapRequiredColumns(
    config.algorithm['columns'],
    config.source,
    config.destination_map,
  );
  return keepColumnList.reduce((memo, col) => Object.assign(memo, { [col]: validatorDict[col] }), {});
}

// Returns a new output configuration with only the columns needed by the
// algorithm (so the validation result of a mapping document only has the mapping columns present)
export function keepOutputColumns(config: Config.FileConfiguration, outputConfig: Config.ColumnMap) {
  const keepColumnSet = new Set(
    mapRequiredColumns(config.algorithm['columns'], config.source, config.destination_map),
  );

  return Object.assign({}, outputConfig, {
    columns: outputConfig.columns.filter(({ alias }) => keepColumnSet.has(alias)),
  });
}
