import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MarketingPageAboutUsComponent,
  MarketingPageEarlyInvestingComponent,
  MarketingPageWelcomeHeroComponent,
  MarketingPageWelcomeInvestmentAccountComponent,
  MarketingPageWelcomeMarketMonitorComponent,
  MarketingSvgOneComponent,
} from '@mm/marketing';

@Component({
  selector: 'app-page-marketing',
  imports: [
    NgOptimizedImage,
    MarketingSvgOneComponent,
    MarketingPageWelcomeHeroComponent,
    MarketingPageWelcomeMarketMonitorComponent,
    MarketingPageWelcomeInvestmentAccountComponent,
    MarketingPageEarlyInvestingComponent,
    MarketingPageAboutUsComponent,
  ],
  template: `
    <div class="relative min-h-[100vh] overflow-x-clip bg-black">
      <app-marketing-svg-one additionalClassed="absolute right-[-100px] top-[250px]" />
      <!-- blob that follows mouse  -->
      <!--<div id="blob" ref={blobRef} class="hidden"></div>-->

      <img
        alt="hero background image"
        [ngSrc]="imageUrl"
        width="1980"
        height="1080"
        priority
        class="absolute top-0 w-[100%] object-cover opacity-30"
      />

      <div class="mx-auto w-11/12 xl:max-w-[1440px]">
        <div class="relative p-4 md:p-10">
          <app-marketing-welcome-page-hero />
        </div>
        <div class="relative mb-16 p-4 sm:px-10 md:mb-[140px] md:p-10">
          <app-marketing-page-welcome-market-monitor />
        </div>
        <div class="relative mb-16 p-4 md:mb-[160px] md:p-10">
          <app-marketing-page-welcome-investment-account />
        </div>
        <div class="relative mb-6 p-4 md:p-10">
          <app-marketing-page-early-investing />
        </div>
        <div class="relative mb-6 p-4 md:p-10">
          <app-marketing-page-about-us />
        </div>

        <!-- TODO - about us -->
        <footer class="h-12 bg-black"></footer>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMarketingComponent {
  readonly imageUrl = 'assets/application/hero-6.webp';
}
