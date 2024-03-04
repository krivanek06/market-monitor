import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import anime from 'animejs';
import {
  WelcomeAboutUs,
  WelcomeHero,
  WelcomeInvestmentAccount,
  WelcomeMarketMonitor,
  WelcomeSchools,
} from '../components/page-specific/welcome';
import { SVG1, SVG2 } from '../components/shared';
import { websiteImageUrls } from '../components/utils';

export default component$(() => {
  const wholePageRef = useSignal<HTMLDivElement | undefined>(undefined);
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
    const rowDivs = Math.ceil((wholePageRef.value?.clientWidth ?? 0) / 100);
    const colDivs = Math.ceil((heroPageRef.value?.clientHeight ?? 0) / 100);
    console.log(rowDivs, colDivs);

    // generate bunch of divs to UI to animate
    for (let col = 0; col < colDivs; col++) {
      for (let row = 0; row < rowDivs; row++) {
        const newDiv = document.createElement('div');
        newDiv.style.width = '100px';
        newDiv.style.height = '100px';
        newDiv.style.background = '#00181f';
        newDiv.style.position = 'absolute';
        newDiv.style.left = `${row * 100}px`;
        newDiv.style.top = `${col * 100}px`;
        //newDiv.style.border = '1px solid black';

        // create random class
        newDiv.classList.add('el');

        // append div to section
        wholePageRef.value?.appendChild(newDiv);

        // destroy div after N seconds
        setTimeout(() => {
          newDiv.remove();
        }, 6000);
      }
    }

    // animate each div
    anime({
      targets: '.el',
      scale: [
        { value: 1, easing: 'easeInOutQuad', duration: 0 },
        { value: 0, easing: 'easeOutSine', duration: 1500, delay: 1500 },
      ],
      delay: anime.stagger(400, { grid: [rowDivs, colDivs], from: 'center' }),
    });

    // reveal hero image
    anime({
      targets: '#hero-bg',
      opacity: [0, 0.4],
      easing: 'easeInOutQuad',
      duration: 2000,
    });

    // remove / add css classes which should be applied after the animation
    if (wholePageRef.value) {
      wholePageRef.value.style.backgroundColor = 'black';
    }
    if (svg2Ref.value) {
      svg2Ref.value.classList.remove('hidden');
    }
    if (blobRef.value) {
      blobRef.value.classList.remove('hidden');
    }
    if (heroBgImageRef.value) {
      heroBgImageRef.value.classList.remove('hidden');
    }
  });

  const heroImage = `${websiteImageUrls}/hero-6.webp`;

  return (
    <div ref={wholePageRef} class="overflow-x-clip relative">
      {/* some svgs */}
      <SVG2 forwardRef={svg2Ref} class="absolute top-[250px] right-[-100px] hidden" />

      <div id="blob" ref={blobRef} class="hidden"></div>

      <img
        ref={heroBgImageRef}
        id="hero-bg"
        src={heroImage}
        class="absolute top-0 w-[100%] h-[500px] object-cover opacity-40 hidden"
      />

      <div class="max-w-[1600px] mx-auto">
        <div ref={heroPageRef} class="relative">
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
