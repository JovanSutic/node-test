module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    "moduleFileExtensions": [
		"ts",
		"js"
	],
	"testMatch": [
		"**/?(*.)+(spec|test).ts"
	],
	"transform": {
		"^.+\\.ts$": [
			"ts-jest",
			{
				"useESM": true,
				"isolatedModules": true
			}
		]
	},
	"moduleNameMapper": {
		"^src/(.*)$": "<rootDir>/src/$1"
	},
	"extensionsToTreatAsEsm": [
		".ts"
	]
  };
  