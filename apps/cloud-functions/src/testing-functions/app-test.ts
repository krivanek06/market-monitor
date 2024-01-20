import { userPortfolioUpdate } from '../schedulers/user-portfolio-update';

export const test_runner = async () => {
  console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
  console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);

  console.log('[Users]: update portfolio');
  await userPortfolioUpdate();
};
