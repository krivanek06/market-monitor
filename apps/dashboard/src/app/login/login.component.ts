import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLoginComponent } from '@market-monitor/modules/page-builder';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, PageLoginComponent],
  template: ` <section>
    <span>Version: {{ version }}</span>
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
