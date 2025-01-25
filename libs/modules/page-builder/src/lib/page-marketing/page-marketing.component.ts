import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, Renderer2, viewChild } from '@angular/core';
import {
  MarketingPageAboutUsComponent,
  MarketingPageEarlyInvestingComponent,
  MarketingPageWelcomeHeroComponent,
  MarketingPageWelcomeInvestmentAccountComponent,
  MarketingPageWelcomeMarketMonitorComponent,
  MarketingSvgOneComponent,
  MarketingSvgTwoComponent,
} from '@mm/marketing';

@Component({
  selector: 'app-page-marketing',
  imports: [
    NgOptimizedImage,
    MarketingSvgOneComponent,
    MarketingSvgTwoComponent,
    MarketingPageWelcomeHeroComponent,
    MarketingPageWelcomeMarketMonitorComponent,
    MarketingPageWelcomeInvestmentAccountComponent,
    MarketingPageEarlyInvestingComponent,
    MarketingPageAboutUsComponent,
  ],
  template: `
    <div class="relative min-h-[100vh] overflow-x-clip bg-black">
      <app-marketing-svg-two addClass="absolute right-[-100px] top-[250px]" />
      <!-- blob that follows mouse  -->
      <div #blob id="blob"></div>

      <img
        alt="hero background image"
        [ngSrc]="imageUrl"
        width="1980"
        height="1080"
        priority
        class="absolute top-0 w-[100%] object-cover opacity-30"
      />

      <div class="mx-auto w-11/12 xl:max-w-[1440px]">
        <!-- welcome hero -->
        <div class="relative p-4 md:p-10">
          <app-marketing-welcome-page-hero />
        </div>
        <!-- market monitor -->
        <div class="relative mb-16 p-4 sm:px-10 md:mb-[140px] md:p-10">
          <app-marketing-page-welcome-market-monitor />
        </div>
        <!-- investment account -->
        <div class="relative mb-16 p-4 md:mb-[160px] md:p-10">
          <app-marketing-svg-two addClass="absolute left-[-500px] top-[300px] hidden md:block" />
          <app-marketing-svg-one addClass="absolute left-0 top-[-40px] h-[175px] w-[175px] opacity-25" />
          <app-marketing-svg-one addClass="absolute left-[120px] top-[120px] h-[175px] w-[175px] opacity-25" />
          <app-marketing-page-welcome-investment-account />
        </div>
        <!-- early investing -->
        <div class="relative mb-6 p-4 md:p-10">
          <app-marketing-svg-one addClass="absolute right-0 top-[-40px] h-[175px] w-[175px] opacity-25" />
          <app-marketing-svg-one addClass="absolute right-[160px] top-[225px] h-[175px] w-[175px] opacity-25" />
          <app-marketing-page-early-investing />
        </div>
        <!-- about us -->
        <div class="relative mb-6 p-4 md:p-10">
          <app-marketing-svg-one addClass="absolute left-0 top-[-40px] h-[175px] w-[175px] opacity-25" />
          <app-marketing-svg-one addClass="absolute right-[160px] top-[225px] h-[175px] w-[175px] opacity-25" />
          <app-marketing-page-about-us />
        </div>
        <footer class="h-6 bg-black"></footer>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    #blob {
      -webkit-filter: blur(25px);
      -moz-filter: blur(25px);
      -o-filter: blur(25px);
      -ms-filter: blur(25px);
      width: 350px;
      height: 350px;
      background: #374151;
      transition: 0.15s linear;
      position: absolute;
      left: 50%;
      top: 50%;
      translate: -50% -50%;
      opacity: 0.3;
      animation:
        blobRadius 5s ease infinite,
        rotate 20s infinite;
    }

    @keyframes blobRadius {
      0%,
      100% {
        border-radius: 43% 77% 80% 40% / 40% 40% 80% 80%;
      }
      20% {
        border-radius: 47% 73% 61% 59% / 47% 75% 45% 73%;
      }
      40% {
        border-radius: 46% 74% 74% 46% / 74% 58% 62% 46%;
      }
      60% {
        border-radius: 47% 73% 61% 59% / 40% 40% 80% 80%;
      }
      80% {
        border-radius: 50% 70% 52% 68% / 51% 61% 59% 69%;
      }
    }

    @keyframes rotate {
      from {
        rotate: 0deg;
        scale: 1 1;
      }

      30% {
        scale: 1.3 1.8;
      }

      70% {
        scale: 1.2 1.5;
      }

      to {
        rotate: 360deg;
        scale: 1 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMarketingComponent {
  private readonly renderer = inject(Renderer2);
  private readonly ngZone = inject(NgZone);
  readonly blobRef = viewChild.required<ElementRef<HTMLDivElement>>('blob');
  readonly imageUrl = 'assets/application/hero-6.webp';

  constructor() {
    this.ngZone.runOutsideAngular(() => {
      this.renderer.listen('document', 'mousemove', (event) => {
        const { pageX, pageY } = event;
        const blobRef = this.blobRef();

        // move blob
        blobRef.nativeElement.animate(
          {
            left: `${pageX}px`,
            top: `${pageY}px`,
          },
          { duration: 20000, fill: 'forwards' },
        );
      });
    });
  }
}
