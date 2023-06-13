import { isPlatformServer } from '@angular/common';
import {
  APP_ID,
  ApplicationConfig,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  inject,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
import { appRoutes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(appRoutes, withEnabledBlockingInitialNavigation()), provideAnimations()],
// };

export const appConfig: ApplicationConfig = {
  providers: [
    // importProvidersFrom(
    //   provideFirebaseApp(() => initializeApp(environment.firebase))
    // ),
    // importProvidersFrom(provideAuth(() => getAuth())),
    // importProvidersFrom(provideFirestore(() => getFirestore())),
    // importProvidersFrom(provideFunctions(() => getFunctions())),
    // importProvidersFrom(provideStorage(() => getStorage())),
    // provideHttpClient(),
    provideRouter(
      appRoutes,
      // this is in place of scrollPositionRestoration: 'disabled',
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
      // in place of initialNavigation: 'enabledBlocking'
      // withEnabledBlockingInitialNavigation(),
      // in place of preloadingStrategy: PreloadAllModules
      withPreloading(PreloadAllModules)
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
  ],
};
