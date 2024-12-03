/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // [...]
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['^.+\\.js$'],
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  // reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './coverage/test-report',
        outputName: 'test-report.xml',
      },
    ],
  ],
  // coverage directory
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'html'],

  verbose: true,
};
