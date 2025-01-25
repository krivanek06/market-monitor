import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarketingSocialsEduardComponent } from '../components';

@Component({
  selector: 'app-marketing-page-about-us',
  imports: [MarketingSocialsEduardComponent],
  template: `
    <section class="mx-auto grid place-content-center lg:w-8/12">
      <h2 class="g-section-title">About us</h2>
      <p class="mb-10 text-center text-xl text-gray-300">
        My name is Eduard Krivanek, and I am the sole developer behind GGFinance. With a passion for education and
        finance, I created this platform to provide students with a practical and engaging way to learn about the
        financial markets.
      </p>

      <div class="mb-10">
        <app-marketing-socials-eduard />
      </div>

      <p class="mb-10 text-center text-xl text-gray-300">
        By simulating real-world trading scenarios, students can gain a basic understanding of finances in an
        interactive way, learning and making mistakes while trading with a demo account. I am committed to continually
        improving GGFinance to ensure it remains a valuable educational tool for schools. Thank you for being a part of
        this journey toward better financial education.
      </p>
      <div class="mb-10 text-center text-xl text-gray-300 [&>*]:mb-2">
        <div>Schools where <span class="text-wt-primary">GGFinance</span> is used are:</div>
        <div>Univezita Komenského v Bratislave</div>
        <div>Ekonimická Univerzita v Bratislav</div>
        <div>Prešovská univerzita v Prešove</div>
        <div>Univerzita Mateja Bela v Banskej Bystrici</div>
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
export class MarketingPageAboutUsComponent {}
