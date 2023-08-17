import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

// --------------------------------------
/**
 * Section used to mock window object on server side, as it is not available
 *
 * preventing the error:
 * - Cannot read properties of undefined (reading 'Core/Chart/Chart.js')
 */
import { createWindow } from 'domino';
import * as fs from 'fs';
import * as path from 'path';

// github issue: https://github.com/angular/angular-cli/issues/25529
const template = fs.readFileSync(path.join('dist/apps/market-monitor/browser', 'index.html')).toString();

const window = createWindow(template);
(global as any).window = window;
(global as any).document = window.document;

// --------------------------------------

export default bootstrap;
