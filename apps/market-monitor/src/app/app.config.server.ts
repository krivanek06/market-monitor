import {
  ApplicationConfig,
  enableProdMode,
  mergeApplicationConfig,
} from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { environment } from '../environments/environment';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

if (environment.production) {
  enableProdMode();
}

export const config = mergeApplicationConfig(appConfig, serverConfig);
