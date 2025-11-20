module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
