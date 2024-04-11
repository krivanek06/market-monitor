import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationFormComponent } from '@mm/authentication/authentication-forms';
import { DialogServiceModule } from '@mm/shared/dialog-manager';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [CommonModule, AuthenticationFormComponent, DialogServiceModule],
  template: `
    <section>
      <div class="pt-[200px] w-full max-w-[800px] mx-auto h-lvh ">
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
