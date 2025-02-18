module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest', // Transform TypeScript files with ts-jest
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/users/**/*.spec.ts'], // Look for .spec.ts files inside the 'users' folder
  };
  