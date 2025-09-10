/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(test|spec).+(ts)'],
  transformIgnorePatterns: ['/node_modules/(?!pretty-bytes)/'],
  transform: {
    "^.+\\.js$": "babel-jest",
    '^.+\\.(ts)$': [
      'ts-jest',
      {
        astTransformers: {
          before: ['ts-jest-mock-import-meta'],
        },
        diagnostics: {
          ignoreCodes: [1343]
        }
      }
    ],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/dist/',
    '/coverage/',
    '.d.ts'
  ],
  
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};