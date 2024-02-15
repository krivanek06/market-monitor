/* eslint-disable */
export default {
  displayName: 'general-util',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['../../../../jest.setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/shared/features/general-util',
};
