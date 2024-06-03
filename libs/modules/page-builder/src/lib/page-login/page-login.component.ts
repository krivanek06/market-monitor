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
      <div class="mx-auto h-lvh w-full max-w-[800px] pt-[200px]">
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
