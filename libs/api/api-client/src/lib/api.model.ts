import { InjectionToken } from '@angular/core';

export const API_FUNCTION_URL = new InjectionToken<string>('API_ENDPOINT_FUNCTION_URL');
export const API_IS_PRODUCTION = new InjectionToken<boolean>('API_IS_PRODUCTION');
