import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-marketing-page-early-investing',
  imports: [MatButtonModule, MatIconModule, NgOptimizedImage, PercentageIncreaseDirective, CurrencyPipe, RouterLink],
  template: `
    <section>
      <div class="g-section-title">Support Early Investing</div>

      <!-- >some info -->
      <div
        class="mx-auto grid justify-center gap-x-10 gap-y-4 text-gray-300 md:flex-row md:justify-around lg:w-9/12 lg:grid-cols-2"
      >
        <p class="text-center text-xl">
          We create a platform to provide basic understanding of finances in an interactive way. Learn and make mistakes
          while trading with a demo account.
        </p>
        <p class="text-center text-xl">
          Create a demo trading account, and learn about investing in a fun and engaging way. Compete, learn, and have
          fun with your friends.
        </p>
      </div>

      <!-- >redirect dashboard button -->
      <div class="my-20 grid place-content-center md:mb-[140px]">
        <button mat-stroked-button routerLink="/app/dashboard" color="primary" class="h-14">
          <div class="flex min-w-[200px] items-center justify-center gap-4 text-lg">
            <span>Dashboard</span>
            <mat-icon>open_in_new</mat-icon>
          </div>
        </button>
      </div>

      <!-- >some info -->
      <div class="mx-auto grid gap-10 p-4 lg:grid-cols-2 xl:w-10/12 xl:p-10 xl:px-10">
        <div class="grid gap-8 text-center text-gray-300 sm:text-left lg:w-11/12 xl:w-9/12">
          <p class="text-xl">
            Create <span class="text-wt-primary">Groups</span> to gather all your friends in one place and compete with
            each other and other groups
          </p>
          <p class="text-xl">
            In <span class="text-wt-primary">Hall of Fame</span> you compete with everybody with a demo account, you can
            compare your tradings to see who is the better strategy
          </p>
          <p class="text-xl">
            You made some bad trades with your demo account? No worries, you can always
            <span class="text-wt-primary">reset your account</span> and have a fresh start
          </p>
        </div>
        <div class="hidden flex-col gap-2 sm:flex">
          <!-- display users -->
          @for (user of testUserNames; track user.displayName) {
            <div
              class="flex items-center justify-between gap-2 rounded-lg border border-solid border-cyan-800 bg-gray-900 bg-opacity-60 px-4 py-2"
            >
              <div class="flex items-center gap-2">
                <img [ngSrc]="user.image" alt="user image" class="h-7 w-7 rounded-lg" width="28" height="28" />
                <span class="text-wt-primary">{{ user.displayName }}</span>
              </div>

              <div class="flex items-center gap-2">
                <div class="text-wt-gray-dark">{{ user.currentCash | currency }}</div>

                <div
                  appPercentageIncrease
                  [useCurrencySign]="true"
                  [currentValues]="{
                    value: user.currentCash,
                    valueToCompare: user.startingCash,
                    hideValue: true,
                  }"
                ></div>
              </div>
            </div>
          }
        </div>
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
export class MarketingPageEarlyInvestingComponent {
  readonly testUserNames = [
    'Eleanor Cassin',
    'Jenna Schuster',
    'Gustavo Jacobi',
    'Miss Paulette Ledner',
    'Dr. Earl Rath',
    'Mr. Johnny Hills',
    'Jeannie Pfeffer',
    'Rafael Donnelly',
  ]
    .map((name, index) => ({
      displayName: name,
      image: `assets/person/test_person_${index}.png`,
      startingCash: 30_000,
      currentCash: 30_000 * (1 + Math.random() * 0.5),
    }))
    .sort((a, b) => b.currentCash - a.currentCash);
}
