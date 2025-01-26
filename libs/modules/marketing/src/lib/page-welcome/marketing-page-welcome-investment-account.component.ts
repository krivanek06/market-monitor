import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarketingImagePreviewComponent } from '../components';
import { MarketingBasicCardComponent } from '../components/marketing-basic-card.component';
import { investmentAccountImages } from '../models';

@Component({
  selector: 'app-marketing-page-welcome-investment-account',
  imports: [MarketingBasicCardComponent, MarketingImagePreviewComponent],
  template: `
    <section class="relative z-10 grid place-content-center">
      <div class="g-section-title">Investment Account</div>

      <div class="mb-8 grid gap-x-4 gap-y-8 pt-4 md:mb-16 md:grid-cols-3 lg:px-10">
        <app-marketing-basic-card>
          <h3 class="text-wt-primary mb-2 w-full text-center text-xl">Portfolio Growth</h3>
          <p class="p-4 text-center text-lg text-gray-300">
            Monitor your portfolio against indexes, see in-depth details of your holdings and view your last
            transactions
          </p>
        </app-marketing-basic-card>
        <app-marketing-basic-card>
          <h3 class="text-wt-primary mb-2 w-full text-center text-xl">Investment Risk</h3>
          <p class="p-4 text-center text-lg text-gray-300">
            Have you ever wondered how risky your portfolio is? Use us to see your portfolio's risk and how it compares
          </p>
        </app-marketing-basic-card>
        <app-marketing-basic-card>
          <h3 class="text-wt-primary mb-2 w-full text-center text-xl">Allocations & Transactions</h3>
          <p class="p-4 text-center text-lg text-gray-300">
            See your portfolio's allocation, your transactions, and your performance over time.
          </p>
        </app-marketing-basic-card>
      </div>

      <div class="hidden overflow-auto md:block">
        <app-marketing-image-preview [images]="investmentAccountImages" />
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
export class MarketingPageWelcomeInvestmentAccountComponent {
  readonly investmentAccountImages = investmentAccountImages;
}
