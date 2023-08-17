export const environment = {
  firebase: {
    projectId: 'market-monitor-prod',
    appId: '1:185409661855:web:0c3e2fbdd4f05709f6ebaa',
    storageBucket: 'market-monitor-prod.appspot.com',
    apiKey: 'AIzaSyAv5SuzwrwGv0Z5RzFYHf5bdkjb60ucOAk',
    authDomain: 'market-monitor-prod.firebaseapp.com',
    messagingSenderId: '185409661855',
    measurementId: 'G-82FD6D7MMR',
  },

  sentry: {
    dns: 'https://a2f4f951e0ad6b5221e3ee68c18f18d1@o4505699066052608.ingest.sentry.io/4505708168151040',
  },

  endpointFunctionsURL: 'localhost:5001/market-monitor-prod/europe-west3',

  production: false,
  version: '1.0.0',
  environment: 'DEV',
};
