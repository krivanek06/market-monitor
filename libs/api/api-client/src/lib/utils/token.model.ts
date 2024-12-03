import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

export const DASHBOARD_VERSION_TOKEN = new InjectionToken<string>('DASHBOARD_VERSION_TOKEN');

export const WINDOW = new InjectionToken<Window>('Global window object', {
  factory: () => {
    const document = inject(DOCUMENT);
    return document.defaultView!;
  },
});
