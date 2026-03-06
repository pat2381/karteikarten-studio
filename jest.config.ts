import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\.tsx?$": ["ts-jest", {}] },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
};
export default config;
