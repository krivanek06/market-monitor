import { InjectionToken, inject } from '@angular/core';

export const ENDPOINT_FUNCTION_URL = new InjectionToken<string>(
  'endpointFunctions'
);

export const DOCUMENT = new InjectionToken<Document>('DocumentToken');

export const WINDOW = new InjectionToken<Window>(
  'An abstraction over global window object',
  {
    factory: () => inject(DOCUMENT).defaultView!,
  }
);

export const NAVIGATOR = new InjectionToken<Navigator>(
  'An abstraction over window.navigator object',
  {
    factory: () => inject(WINDOW).navigator,
  }
);
