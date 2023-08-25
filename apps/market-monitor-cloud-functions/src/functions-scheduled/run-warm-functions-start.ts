import { onSchedule } from 'firebase-functions/v2/scheduler';

/**
 * every 5minutes ping some critical firebase functions to minimize cold start
 */
export const run_warm_function_start = onSchedule('5 * * * *', async (event) => {
  console.log('Pinging functions');

  const ssrUniversal = 'https://ssr-jhgz46ksfq-ey.a.run.app';
  const newsGeneral = 'https://getmarketnews-jhgz46ksfq-ey.a.run.app?news_types=general';

  // ping functions - if any of them fails it won't affect the rest
  const result = await Promise.allSettled([fetch(ssrUniversal), fetch(newsGeneral)]);

  // log results
  const settled = result.filter((d) => d.status === 'fulfilled');
  const rejected = result.filter((d) => d.status === 'rejected');
  console.log(`Pinging functions results, settled: ${settled.length}, rejected: ${rejected.length}`);
});
