import { isPlatformServer } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { APP_ID, ApplicationConfig, PLATFORM_ID, PLATFORM_INITIALIZER, inject } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
// import * as Sentry from '@sentry/angular-ivy';
import { API_IS_PRODUCTION } from '@market-monitor/api-client';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(
      appRoutes,
      // this is in place of scrollPositionRestoration: 'disabled',
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      // in place of initialNavigation: 'enabledBlocking'
      withEnabledBlockingInitialNavigation(),
      // in place of preloadingStrategy: PreloadAllModules
      withPreloading(PreloadAllModules),
    ),
    provideAnimations(),
    provideClientHydration(),
    // withNoHttpTransferCache(),
    { provide: APP_ID, useValue: 'serverApp' },
    {
      provide: PLATFORM_INITIALIZER,
      useFactory: () => {
        const isServer = isPlatformServer(inject(PLATFORM_ID));
        // we don't want to inject the script on the server side
        if (!isServer) {
          window.console.log = () => {
            /* disable console log on prod */
          };

          // inject analytics
          // injectAnalyticsScript({ gaTrackId: ANALYTICS_TRACK_ID });
          // trackRouterEvents();
        }
      },
      multi: true,
    },
    {
      provide: API_IS_PRODUCTION,
      useValue: environment.production,
    },
    // {
    //   provide: ErrorHandler,
    //   useValue: Sentry.createErrorHandler({
    //     showDialog: true,
    //   }),
    // },
    // {
    //   provide: Sentry.TraceService,
    //   deps: [Router],
    // },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: () => () => {},
    //   deps: [Sentry.TraceService],
    //   multi: true,
    // },
  ],
};
