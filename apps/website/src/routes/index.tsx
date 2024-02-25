import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  WelcomeAboutUs,
  WelcomeHero,
  WelcomeInvestmentAccount,
  WelcomeMarketMonitor,
  WelcomeSchools,
} from '../components/page-specific/welcome';

export default component$(() => {
  return (
    <div class="overflow-x-clip ">
      <img src="/images/hero-6.jpeg" class="absolute top-0 w-[100%] h-[70%] object-cover opacity-40" />

      <div class="max-w-[1620px] mx-auto">
        <div class="relative">
          <WelcomeHero />
          {/* <SVG1 class="absolute bottom-[-145px] left-[100px] opacity-30" />
        <SVG2 class="absolute bottom-0" /> */}
        </div>
        <div class="relative mb-[120px]">
          <WelcomeMarketMonitor />
        </div>
        <div class="relative mb-[120px]">
          <WelcomeInvestmentAccount />
        </div>
        <div class="relative mb-[120px]">
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
