import { type JestConfigWithTsJest, createDefaultPreset } from "ts-jest"

const presetConfig = createDefaultPreset({
  tsconfig: "./admin/tsconfig.json",
})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  testMatch: ["**/__tests__/**/*.(spec|test).(ts|tsx|jsx|js)"],
  testPathIgnorePatterns: ["<rootDir>/playground/"],
  collectCoverage: true,
  collectCoverageFrom: [
    "./(admin|server)/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/tests/**",
    "!**/__mocks__/**",
  ],
  coverageDirectory: "./coverage",
}

export default jestConfig
