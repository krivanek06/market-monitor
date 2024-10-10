import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
// import * as Sentry from '@sentry/angular-ivy';
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
      // add transition animations
      withViewTransitions(),
    ),
    // apply zoneless change detection
    provideExperimentalZonelessChangeDetection(),
    // allow animations - load async
    provideAnimationsAsync(),
    // provideClientHydration(),
    // withNoHttpTransferCache(),
  ],
};
