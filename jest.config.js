/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // これがあると速くなる
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^it/(.*)$": "<rootDir>/tests/integration/$1",
  },
};
