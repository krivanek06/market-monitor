import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import anime from 'animejs';
import { Button } from '../../shared/Button';
import { TextModifactor, dashboardURL, searchURL } from '../../utils';

export const WelcomeHero = component$(() => {
  const heroAppDescriptionRef = useSignal<HTMLDivElement | undefined>(undefined);
  const heroActionButtonsRef = useSignal<HTMLDivElement | undefined>(undefined);

  useVisibleTask$(() => {
    setTimeout(() => {
      // some css to display elements after SSR
      if (heroAppDescriptionRef.value) {
        heroAppDescriptionRef.value.classList.remove('invisible');
        heroAppDescriptionRef.value.classList.add('visible');
      }

      anime({
        targets: '#hero-app-description',
        opacity: [0, 0.9],
        easing: 'easeInOutQuad',
        duration: 2000,
      });
    }, 1200);

    setTimeout(() => {
      if (heroActionButtonsRef.value) {
        heroActionButtonsRef.value.classList.remove('invisible');
        heroActionButtonsRef.value.classList.add('visible');
      }

      anime({
        targets: '#hero-action-buttons',
        opacity: [0, 0.9],
        easing: 'easeInOutQuad',
        duration: 2000,
      });
    }, 1500);
  });

  return (
    <section class="-mt-10 grid h-screen place-content-center gap-y-12">
      <h1
        class={
          'animate-in fade-in zoom-in duration-2000 lg:font-outline-2 z-10 inline-block text-center text-6xl max-lg:text-cyan-800 md:bg-gradient-to-b md:from-cyan-700 md:to-black md:bg-clip-text md:text-transparent lg:-mt-20'
        }
      >
        <TextModifactor name="GGFinance" />
      </h1>

      <div>
        <div
          ref={heroAppDescriptionRef}
          id="hero-app-description"
          class="invisible mx-auto flex w-[320px] flex-col px-4 text-center text-xl text-gray-500 max-md:gap-y-4 sm:w-[650px] lg:mb-10"
        >
          <span>
            Free to use trading simulator, designed to help learning financial literacy, mainly intended for schools to
            make lectures more interactive.
          </span>
        </div>
      </div>

      <div
        ref={heroActionButtonsRef}
        id="hero-action-buttons"
        class="invisible z-10 mx-auto flex flex-col items-center gap-x-8 gap-y-8 sm:flex-row"
      >
        <Button onClick$={() => (window.location.href = searchURL)} class="hidden h-14 w-[220px] text-lg lg:block">
          <span>Search</span>
        </Button>
        <Button
          onClick$={() => (window.location.href = dashboardURL)}
          class="duration-2500 h-14 w-[220px] text-lg lg:animate-pulse"
        >
          <span>Dashboard</span>
        </Button>
      </div>
    </section>
  );
});
