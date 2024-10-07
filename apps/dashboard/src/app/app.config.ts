import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { Auth, connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { Firestore, connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { Functions, connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { AUTHENTICATION_ACCOUNT_TOKEN, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { IS_DEV_TOKEN } from '@mm/shared/data-access';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions()),
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
      // enable component input binding
      withComponentInputBinding(),
    ),
    // used to avoid error: No provider found for DateAdapter
    provideNativeDateAdapter(),
    // lazy load animation modules
    provideAnimationsAsync(),
    // apply zoneless change detection
    // provideExperimentalZonelessChangeDetection(),
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),
    {
      provide: AUTHENTICATION_ACCOUNT_TOKEN,
      useExisting: AuthenticationUserStoreService,
    },
    {
      provide: IS_DEV_TOKEN,
      useValue: !environment.production,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Functions, Firestore, Auth],
      useFactory: () => {
        const region = 'europe-central2';
        const localhost = '127.0.0.1';
        const functions = inject(Functions);
        const firestore = inject(Firestore);
        const auth = inject(Auth);

        functions.region = region;

        return () => {
          if (!environment.production) {
            console.log('%c[Firebase]: Connect to emulator', 'color: #bada55; font-size: 16px;');
            connectFunctionsEmulator(functions, localhost, 5001);
            connectFirestoreEmulator(firestore, localhost, 8080);
            connectAuthEmulator(auth, `http://${localhost}:9099`);
          }
        };
      },
    },
  ],
};
