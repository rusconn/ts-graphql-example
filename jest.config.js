module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["@swc/jest"],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^it/(.*)$": "<rootDir>/tests/integration/$1",
  },
};
