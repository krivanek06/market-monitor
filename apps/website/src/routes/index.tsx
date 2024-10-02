import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import anime from 'animejs';
import {
  WelcomeHero,
  WelcomeInvestmentAccount,
  WelcomeMarketMonitor,
  WelcomeSchools,
} from '../components/page-specific/welcome';
import { SVG1, SVG2 } from '../components/shared';
import { websiteImageUrls } from '../components/utils';

export default component$(() => {
  const heroPageRef = useSignal<HTMLDivElement | undefined>(undefined);
  const blobRef = useSignal<HTMLDivElement | undefined>(undefined);
  const heroBgImageRef = useSignal<HTMLImageElement | undefined>(undefined);
  const svg2Ref = useSignal<SVGSVGElement | undefined>(undefined);

  /**
   * create a blob following the mouse
   */
  useVisibleTask$(() => {
    const blobVal = blobRef.value;
    if (!blobVal) {
      return;
    }

    // change blob position on mouse move
    window.onpointermove = (event) => {
      const { pageX, pageY } = event;
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

  useVisibleTask$(() => {
    setTimeout(() => {
      // reveal hero image
      anime({
        targets: '#hero-bg',
        opacity: [0, 0.4],
        easing: 'easeInOutQuad',
        duration: 2500,
      });

      // reveal a svg
      anime({
        targets: '#hero-svg',
        opacity: [0, 1],
        easing: 'easeInOutQuad',
        duration: 2500,
      });

      // remove / add css classes which should be applied after the animation
      if (svg2Ref.value) {
        svg2Ref.value.classList.add('md:block');
      }
      if (blobRef.value) {
        blobRef.value.classList.add('lg:block');
      }
      if (heroBgImageRef.value) {
        heroBgImageRef.value.classList.remove('hidden');
      }
    }, 500);
  });

  const heroImage = `${websiteImageUrls}/hero-6.webp`;

  return (
    <div class="relative overflow-clip bg-black">
      {/* some svgs */}
      <SVG2 forwardRef={svg2Ref} id="hero-svg" class="absolute right-[-100px] top-[250px] hidden" />
      {/* blob that follows mouse */}
      <div id="blob" ref={blobRef} class="hidden"></div>

      <img
        ref={heroBgImageRef}
        id="hero-bg"
        alt="hero background image"
        src={heroImage}
        width={1980}
        height={1080}
        class="absolute top-0 hidden w-[100%] object-cover opacity-30"
      />

      <div class="mx-auto w-11/12 xl:max-w-[1440px]">
        <div ref={heroPageRef} class="relative p-4 md:p-10">
          <WelcomeHero />
        </div>
        <div class="relative mb-16 p-4 sm:px-10 md:mb-[140px] md:p-10">
          <WelcomeMarketMonitor />
        </div>
        <div class="relative mb-16 p-4 md:mb-[160px] md:p-10">
          <SVG2 class="absolute left-[-500px] top-[300px] hidden md:block" />
          <SVG1 class="absolute left-0 top-[-40px] h-[175px] w-[175px] opacity-25" />
          <SVG1 class="absolute left-[120px] top-[120px] h-[175px] w-[175px] opacity-25" />
          <WelcomeInvestmentAccount />
        </div>
        <div class="relative mb-6 p-4 md:p-10">
          <SVG1 class="absolute right-0 top-[-40px] h-[175px] w-[175px] opacity-25" />
          <SVG1 class="absolute right-[160px] top-[225px] h-[175px] w-[175px] opacity-25" />
          <WelcomeSchools />
        </div>
        {/* <div class="relative p-4 md:p-10">
          <WelcomeAboutUs />
        </div> */}
        <footer class="h-12 bg-black"></footer>
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
