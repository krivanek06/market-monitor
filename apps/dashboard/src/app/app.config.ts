import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { Auth, connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { Firestore, connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { Functions, connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { Storage, connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import {
  AUTHENTICATION_ACCOUNT_TOKEN,
  AuthenticationUserStoreService,
} from '@market-monitor/modules/authentication/data-access';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations-async';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
      provideStorage(() => getStorage()),
      provideFunctions(() => getFunctions()),
    ]),
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
      // lazy load animation modules
      // provideAnimationsAsync()
    ),
    provideAnimations(),
    {
      provide: AUTHENTICATION_ACCOUNT_TOKEN,
      useExisting: AuthenticationUserStoreService,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Functions, Firestore, Storage, Auth],
      useFactory: () => {
        const localhost = 'http://127.0.0.1';
        const functions = inject(Functions);
        const firestore = inject(Firestore);
        const storage = inject(Storage);
        const auth = inject(Auth);

        return () => {
          if (!environment.production) {
            connectFunctionsEmulator(functions, localhost, 5001);
            connectFirestoreEmulator(firestore, localhost, 8080);
            connectStorageEmulator(storage, localhost, 9199);
            connectAuthEmulator(auth, `${localhost}:9099`);
          }
        };
      },
    },
  ],
};
