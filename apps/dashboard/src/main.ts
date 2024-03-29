import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// disable console logs in production
if (environment.production) {
  // on ssr there is no window object
  if (window) {
    window.console.log = () => {};
  }
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
