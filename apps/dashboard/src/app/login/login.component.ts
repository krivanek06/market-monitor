import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLoginComponent } from '@mm/page-builder';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PageLoginComponent],
  template: ` <section>
    <span class="absolute left-0 top-0 hidden md:block">Version: {{ version }}</span>
    <app-page-login />
  </section>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  version = environment.version;
}
