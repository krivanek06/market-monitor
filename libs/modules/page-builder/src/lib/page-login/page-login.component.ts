import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationFormComponent } from '@market-monitor/modules/authentication/features';
import { DialogServiceModule } from '@market-monitor/shared/features/dialog-manager';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [CommonModule, AuthenticationFormComponent, DialogServiceModule],
  template: `
    <section>
      <div class="mt-[200px] w-full md:w-7/12 xl:w-6/12 mx-auto">
        <app-authentication-form></app-authentication-form>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoginComponent {}
