import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationFormComponent } from '@mm/authentication/authentication-forms';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [AuthenticationFormComponent],
  template: `
    <section class="c-wrapper">
      <div class="flex min-h-lvh flex-col gap-y-10 lg:flex-row">
        <!-- left side -->
        <div class="lg:flex-1">
          <!-- background circles -->
          <div class="c-circle-1 c-circle hidden lg:block"></div>
          <div class="c-circle-2 c-circle hidden lg:block"></div>
          <div class="c-circle-3 c-circle hidden lg:block"></div>

          <!-- page title and description -->
          <div class="relative z-10 mx-auto w-10/12 pt-[40px] lg:pt-[100px] xl:w-9/12">
            <div class="text-wt-primary mb-4 text-5xl opacity-80 max-lg:text-center">GGFinance</div>
            <div class="grid gap-10 text-3xl text-gray-400 max-lg:text-center">
              <span
                >Discover investing with our engaging, <span class="text-wt-primary">risk-free</span> trading
                simulator.</span
              >
              <span class="hidden lg:block">
                Build financial skills, track your progress, and competing with friends.
              </span>
            </div>
          </div>
        </div>

        <!-- right side -->
        <div class="px-5 lg:flex-1 lg:pt-[160px]">
          <!--<div class="text-wt-primary mb-10 text-center text-5xl tracking-widest opacity-80">GGFinance</div>-->
          <div
            class="rounded-lg bg-[#02070f] p-4 shadow-lg max-lg:mx-auto sm:h-[600px] sm:w-10/12 sm:p-8 lg:ml-8 lg:w-[520px] xl:w-[620px] xl:p-12 2xl:ml-32"
          >
            <app-authentication-form />
          </div>
        </div>
      </div>

      <!-- footer - empty space -->
      <footer class="h-[100px]"></footer>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-circle {
      position: absolute;
      border-radius: 50%;
    }

    .c-circle-1 {
      width: 800px;
      height: 800px;
      left: -10%;
      top: -10%;
      background-color: #02081394;
    }

    .c-circle-2 {
      width: 620px;
      height: 620px;
      left: 16%;
      top: 5%;
      background-color: #0107117a;
    }

    .c-circle-3 {
      width: 520px;
      height: 520px;
      left: 8%;
      top: 34%;
      background-color: #06112391;
    }

    .c-wrapper {
      background: linear-gradient(315deg, #000000 10%, #040d1c 38%, #001435 98%);
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
