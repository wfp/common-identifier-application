const config = {
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
    coverageReporters: ["cobertura", "lcov", "html"],

    verbose: true,
};

module.exports = config;