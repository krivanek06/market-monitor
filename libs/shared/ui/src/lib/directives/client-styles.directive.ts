import { Directive, HostBinding, Input, inject } from '@angular/core';
import { PlatformService } from '../utils';

@Directive({
  selector: '[appClientStyles]',
  standalone: true,
})
export class ClientStylesDirective {
  @Input({ transform: (value: number) => String(value) }) appHeight: string = '';
  @Input({ transform: (value: number) => String(value) }) appMinHeight: string = '';

  platformService = inject(PlatformService);

  @HostBinding('style.height.px')
  get height(): string {
    return this.platformService.isBrowser ? this.appHeight : '';
  }

  @HostBinding('style.min-height.px')
  get minHeight(): string {
    return this.platformService.isBrowser ? this.appMinHeight : '';
  }
}
