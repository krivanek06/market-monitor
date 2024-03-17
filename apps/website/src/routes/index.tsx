import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
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
import { isScreenLarger, websiteImageUrls } from '../components/utils';

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

  const setDefaultValues = $(() => {
    if (wholePageRef.value) {
      wholePageRef.value.style.backgroundColor = 'black';
    }
    if (svg2Ref.value) {
      svg2Ref.value.classList.add('md:block');
    }
    if (blobRef.value) {
      blobRef.value.classList.add('md:block');
    }
    if (heroBgImageRef.value) {
      heroBgImageRef.value.classList.remove('hidden');
    }
  });

  useVisibleTask$(() => {
    // if mobile do not animate
    if (!isScreenLarger('LAYOUT_SM')) {
      setDefaultValues();
      return;
    }

    const rowDivs = Math.ceil((wholePageRef.value?.clientWidth ?? 0) / 100);
    const colDivs = Math.ceil((heroPageRef.value?.clientHeight ?? 0) / 100);
    // console.log(rowDivs, colDivs);

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
    setDefaultValues();
  });

  const heroImage = `${websiteImageUrls}/hero-6.webp`;

  return (
    <div ref={wholePageRef} class="relative overflow-x-clip">
      {/* some svgs */}
      <SVG2 forwardRef={svg2Ref} class="absolute top-[250px] right-[-100px] hidden" />
      {/* blob that follows mouse */}
      <div id="blob" ref={blobRef} class="hidden"></div>

      <img
        ref={heroBgImageRef}
        id="hero-bg"
        alt="hero background image"
        src={heroImage}
        width={1980}
        height={1080}
        class="absolute top-0 w-[100%] object-cover opacity-30 hidden"
      />

      <div class="max-w-[1600px] mx-auto">
        <div ref={heroPageRef} class="relative p-4 md:p-10">
          <WelcomeHero />
        </div>
        <div class="relative mb-16 md:mb-[140px] p-4 md:p-10">
          <WelcomeMarketMonitor />
        </div>
        <div class="relative mb-16 md:mb-[160px] p-4 md:p-10">
          <SVG2 class="absolute top-[300px] left-[-500px] hidden md:block" />
          <SVG1 class="absolute top-[-40px] left-0 opacity-25 w-[175px] h-[175px]" />
          <SVG1 class="absolute top-[120px] left-[120px] opacity-25 w-[175px] h-[175px]" />
          <WelcomeInvestmentAccount />
        </div>
        <div class="relative mb-16 md:mb-[160px] p-4 md:p-10">
          <SVG1 class="absolute top-[-40px] right-0 opacity-25 w-[175px] h-[175px]" />
          <SVG1 class="absolute top-[225px] right-[160px] opacity-25 w-[175px] h-[175px]" />
          <WelcomeSchools />
        </div>
        <div class="relative p-4 md:p-10">
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
