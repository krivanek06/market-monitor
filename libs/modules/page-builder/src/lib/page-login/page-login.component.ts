import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DASHBOARD_VERSION_TOKEN } from '@mm/api-types';
import { AuthenticationFormComponent } from '@mm/authentication/authentication-forms';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [AuthenticationFormComponent],
  template: `
    <span class="absolute left-0 top-0 hidden md:block">Version: {{ version }}</span>
    <section class="c-wrapper">
      <div class="mx-auto flex min-h-lvh max-w-[1660px] flex-col gap-y-10 lg:flex-row">
        <!-- left side -->
        <div class="lg:basis-2/5">
          <!-- background circles -->
          <div class="c-circle-1 c-circle hidden lg:block"></div>
          <div class="c-circle-2 c-circle hidden lg:block"></div>
          <div class="c-circle-3 c-circle hidden lg:block"></div>

          <!-- page title and description -->
          <div class="relative z-10 mx-auto w-10/12 pt-[40px] lg:pt-[100px] xl:w-10/12 xl:pl-10">
            <div class="text-wt-primary mb-4 text-5xl opacity-80 max-lg:text-center">GGFinance</div>
            <div class="grid gap-10 text-2xl text-gray-400 max-lg:text-center">
              <span>
                Discover investing with our engaging, <span class="text-wt-primary">risk-free</span> trading simulator.
              </span>
              <span class="hidden lg:block">
                Build financial skills, track your progress, and competing with friends.
              </span>
            </div>
          </div>
        </div>

        <!-- right side -->
        <div class="px-5 lg:basis-3/5 lg:pt-[160px]">
          <!--<div class="text-wt-primary mb-10 text-center text-5xl tracking-widest opacity-80">GGFinance</div>-->
          <div
            class="relative z-10 mx-auto rounded-lg bg-[#02070f] p-4 shadow-lg sm:h-[600px] sm:w-10/12 sm:p-8 lg:w-[520px] xl:w-[620px]"
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

    ::ng-deep .mat-divider {
      border-color: #2f2f2f !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoginComponent {
  private readonly document = inject(DOCUMENT);
  readonly version = inject(DASHBOARD_VERSION_TOKEN);
  constructor() {
    this.document.body.classList.add('dark-theme');
  }
}
