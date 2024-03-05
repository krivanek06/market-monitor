import { component$ } from '@builder.io/qwik';
import { Button } from '../../shared/Button';
import { TextModifactor } from '../../utils';

export const WelcomeHero = component$(() => {
  return (
    <section class="h-screen grid place-content-center">
      <h1
        class={
          ' mt-[-100px] md:mt-[-180px] z-10 text-6xl bg-clip-text text-transparent inline-block bg-gradient-to-b from-cyan-700 to-black animate-in fade-in zoom-in duration-2000 font-outline-4 '
        }
      >
        <TextModifactor name="GGFinance" />
      </h1>

      <div class="flex flex-col sm:flex-row items-center gap-x-8 gap-y-4 animate-in fade-in duration-2000 mx-auto z-10 ">
        <Button onClick$={() => console.log('lll')} class="w-[320px] sm:w-[220px] text-lg">
          <span>Search</span>
        </Button>
        <Button onClick$={() => console.log('lll')} class="w-[320px] sm:w-[220px] text-lg animate-pulse duration-2500">
          <span>Dashboard</span>
        </Button>
      </div>
    </section>
  );
});
