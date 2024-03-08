import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// enable sentry only on production
if (environment.production) {
  // disable console log on prod
  if (window) {
    window.console.log = () => {};
  }
}

bootstrapApplication(AppComponent, appConfig)
  .then((success) => console.log(`Bootstrap success`))
  .catch((err) => console.error(err));
