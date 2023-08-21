import { InjectionToken } from '@angular/core';

export const API_FUNCTION_URL = new InjectionToken<string>('API_ENDPOINT_FUNCTION_URL');
export const API_IS_PRODUCTION = new InjectionToken<boolean>('API_IS_PRODUCTION');

/**
 * construct correct endpoint to target cloud functions
 * if Prod is false => http://127.0.0.1:5001/market-monitor-prod/us-central1/getstockdetails
 * if Prod is true => https://getstockdetails-jhgz46ksfq-ey.a.run.app
 *
 * @param isProd
 * @param endpoint
 *  if Prod is false => 127.0.0.1:5001/market-monitor-prod/us-central1
 *  if Prod is true => jhgz46ksfq-ey.a.run.app
 * @param method - example: getstockdetails
 */
export const constructCFEndpoint = (isProd: boolean, endpoint: string, method: string, args: string = '') => {
  if (isProd) {
    return `https://${method}-${endpoint}?${args}`;
  }
  return `http://${endpoint}/${method}?${args}`;
};
