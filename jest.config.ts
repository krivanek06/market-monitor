import { getJestProjects } from '@nx/jest';

export default {
  projects: getJestProjects(),
  setupFilesAfterEnv: ['./setup.jest.ts'],
};
