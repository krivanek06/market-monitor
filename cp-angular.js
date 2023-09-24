const fs = require('fs-extra');

// Copy Angular build to functions folder
(async () => {
  const src = './dist/apps/market-monitor';
  const copy = './dist/apps/cloud-functions';

  await fs.copy(src, copy);

  console.log('Angular build copied to functions folder');
})();
