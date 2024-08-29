import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationFormComponent } from '@mm/authentication/authentication-forms';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [AuthenticationFormComponent],
  template: `
    <section class="c-wrapper">
      <div class="mx-auto h-lvh w-full max-w-[640px] pt-[160px]">
        <div class="text-wt-primary mb-10 text-center text-5xl tracking-widest opacity-60">GGFinance</div>
        <app-authentication-form />
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-wrapper {
      background: linear-gradient(315deg, #121212 10%, #051421 38%, #050505 98%);
    }

    ::ng-deep .mdc-text-field--filled:not(.mdc-text-field--disabled) {
      background-color: #2c2c2c42 !important;
      border: 1px solid #2f2f2f !important;
    }

    ::ng-deep .mat-divider {
      border-color: #2f2f2f !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoginComponent {}
