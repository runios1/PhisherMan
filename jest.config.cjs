module.exports = {
  transform: {
    "^.+\\.mjs$": "babel-jest",
  },
  moduleFileExtensions: ["js", "mjs"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
};
