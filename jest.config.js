module.exports = {
    "globals": {
        "ts-jest": {
            "tsConfig": "tsconfig.jest.json",
            "diagnostics": false,
            // "diagnostics": {
            //     "ignoreCodes": [2571, 6031, 18003]
            // },
        }
    },
    "roots": [
        // "/src",
        // "<rootDir>/src",
        "<rootDir>/tests"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    // testRegex: '<rootDir>/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
};