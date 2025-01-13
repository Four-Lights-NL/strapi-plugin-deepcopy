import { type JestConfigWithTsJest, createDefaultPreset } from "ts-jest"

const presetConfig = createDefaultPreset({
  tsconfig: "./admin/tsconfig.test.json",
})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  testMatch: ["**/__tests__/**/*.(spec|test).(ts|tsx|jsx|js)"],
  testPathIgnorePatterns: ["<rootDir>/playground/"],
  collectCoverage: true,
  coverageDirectory: "./coverage",
}

export default jestConfig
