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
    <div class="overflow-x-clip">
      <div class="relative">
        <WelcomeHero />
        {/* <SVG1 class="absolute bottom-[-145px] left-[100px] opacity-30" />
        <SVG2 class="absolute bottom-0" /> */}
      </div>
      <div class="relative">
        <WelcomeMarketMonitor />
      </div>
      <div class="relative">
        <WelcomeInvestmentAccount />
      </div>
      <div class="relative">
        <WelcomeSchools />
      </div>
      <div class="relative">
        <WelcomeAboutUs />
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
