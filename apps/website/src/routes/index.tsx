import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  WelcomeAboutUs,
  WelcomeHero,
  WelcomeInvestmentAccount,
  WelcomeMarketMonitor,
  WelcomeSchools,
} from '../components/page-specific/welcome';
import { SVG1, SVG2 } from '../components/shared';

export default component$(() => {
  return (
    <div class="overflow-x-clip ">
      <img src="/images/hero-6.jpeg" class="absolute top-0 w-[100%] h-[70%] object-cover opacity-40" />

      <div class="max-w-[1600px] mx-auto">
        <div class="relative">
          <WelcomeHero />
          {/* <SVG1 class="absolute bottom-[-145px] left-[100px] opacity-30" />
        <SVG2 class="absolute bottom-0" /> */}
          <SVG2 class="absolute top-[300px] right-[-140px]" />
        </div>
        <div class="relative mb-[140px]">
          <WelcomeMarketMonitor />
        </div>
        <div class="relative mb-[160px]">
          <SVG2 class="absolute top-[300px] left-[-500px]" />
          <SVG1 class="absolute top-[-40px] left-0 opacity-25 w-[175px] h-[175px]" />
          <SVG1 class="absolute top-[120px] left-[120px] opacity-25 w-[175px] h-[175px]" />
          <WelcomeInvestmentAccount />
        </div>
        <div class="relative mb-[160px]">
          <SVG1 class="absolute top-[-40px] right-0 opacity-25 w-[175px] h-[175px]" />
          <SVG1 class="absolute top-[225px] right-[160px] opacity-25 w-[175px] h-[175px]" />
          <WelcomeSchools />
        </div>
        <div class="relative">
          <WelcomeAboutUs />
        </div>

        <footer class="min-h-[100px]"></footer>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
