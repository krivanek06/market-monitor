import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// enable sentry only on production
if (environment.production) {
  // Sentry.init({
  //   dsn: environment.sentry.dns,
  //   environment: environment.environment,
  //   integrations: [
  //     new Sentry.BrowserTracing({
  //       // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  //       tracePropagationTargets: ['localhost'],
  //       routingInstrumentation: Sentry.instrumentAngularRouting,
  //     }),
  //     // new Sentry.Replay(),
  //   ],
  //   // Performance Monitoring
  //   tracesSampleRate: environment.production ? 0.2 : 1,
  //   // Session Replay
  //   // replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  //   // replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  // });
}

bootstrapApplication(AppComponent, appConfig)
  .then((success) => console.log(`Bootstrap success`))
  .catch((err) => console.error(err));
