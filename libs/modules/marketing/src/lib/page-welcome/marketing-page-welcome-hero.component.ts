import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MarketingTextModificatorComponent } from '../components/marketing-text-modificator.component';

@Component({
  selector: 'app-marketing-welcome-page-hero',
  imports: [MatButtonModule, MarketingTextModificatorComponent],
  template: `
    <section class="-mt-10 grid h-screen place-content-center gap-y-12">
      <h1
        class="animate-in fade-in zoom-in duration-2000 lg:font-outline-2 z-10 inline-block text-center text-8xl max-md:text-cyan-800 md:bg-gradient-to-b md:from-cyan-500 md:to-black md:bg-clip-text md:text-transparent lg:-mt-20"
      >
        <app-marketing-text-modificator originalText="GGFinance" />
      </h1>

      <div>
        <div
          class="mx-auto flex w-[320px] flex-col px-4 text-center text-xl text-gray-400 max-md:gap-y-4 sm:w-[650px] lg:mb-10"
        >
          <span>
            A free-to-use trading simulator designed to help teach financial literacy, primarily intended for schools to
            make lessons more interactive
          </span>
        </div>
      </div>

      <div class="z-10 mx-auto flex flex-col items-center gap-x-8 gap-y-8 sm:flex-row">
        <button mat-stroked-button color="primary" type="button" class="h-14 w-[220px] text-lg">
          <span>Dashboard</span>
        </button>
      </div>
    </section>
  `,
  styles: [],
})
export class MarketingPageWelcomeHeroComponent {}
