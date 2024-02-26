import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
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
  const blobRef = useSignal<HTMLDivElement | undefined>(undefined);

  useVisibleTask$(() => {
    const blobVal = blobRef.value;
    if (!blobVal) {
      return;
    }

    // change blob position on mouse move
    window.onpointermove = (event) => {
      const { pageX, pageY, clientX, clientY } = event;
      //console.log(event);
      //console.log(clientX, clientY);
      blobVal.animate(
        {
          left: `${pageX}px`,
          top: `${pageY}px`,
        },
        { duration: 20000, fill: 'forwards' },
      );
    };

    // on reload page scroll to top
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  });

  return (
    <div class="overflow-x-clip">
      {/* some svgs */}
      <SVG2 class="absolute top-[250px] right-[-100px]" />

      <div id="blob" ref={blobRef}></div>

      <img src="/images/hero-6.jpeg" class="absolute top-0 w-[100%] h-[70%] object-cover opacity-40" />

      <div class="max-w-[1600px] mx-auto">
        <div class="relative">
          <WelcomeHero />
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
