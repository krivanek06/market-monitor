import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private platformId: Object;
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get isServer(): boolean {
    return isPlatformServer(this.platformId);
  }
}

export const IS_SERVER_PLATFORM = new InjectionToken<boolean>('IS_SERVER_PLATFORM', {
  factory() {
    return isPlatformServer(inject(PLATFORM_ID));
  },
});
