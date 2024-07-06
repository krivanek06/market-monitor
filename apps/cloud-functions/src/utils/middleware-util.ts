export const measureFunctionExecutionTime = async (fn: () => Promise<unknown>) => {
  const startTime = performance.now();
  console.log('--- start ---');

  await fn();

  console.log('--- finished ---');

  const endTime = performance.now();
  const secondsDiff = Math.round((endTime - startTime) / 1000);
  console.log(`Function took: ~${secondsDiff} seconds`);
};

export const isFirebaseEmulator = () =>
  process.env.FUNCTIONS_EMULATOR === 'true' && process.env.FIRESTORE_EMULATOR_HOST === '127.0.0.1:8080';
