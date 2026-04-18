module.exports = {
  projects: [
    {
      displayName: "sdk-js",
      preset: "ts-jest",
      testEnvironment: "node",
      rootDir: "sdk-js",
      testMatch: ["<rootDir>/src/**/__tests__/**/*.ts", "<rootDir>/src/**/?(*.)+(spec|test).ts"],
      collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/*.d.ts",
        "!<rootDir>/src/**/index.ts",
      ],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    {
      displayName: "cdn",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      rootDir: "cdn",
      testMatch: ["<rootDir>/src/**/__tests__/**/*.ts", "<rootDir>/src/**/?(*.)+(spec|test).ts"],
      collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/*.d.ts",
        "!<rootDir>/src/**/*.test.ts",
      ],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  ],
  testTimeout: 10000,
  forceExit: true,
};
