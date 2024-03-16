/* eslint-disable */
export default {
  displayName: 'website',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['../../jest.setup.js'],
  coverageDirectory: '../../coverage/apps/website',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
