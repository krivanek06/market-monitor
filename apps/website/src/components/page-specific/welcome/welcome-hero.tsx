import { component$ } from '@builder.io/qwik';
import { Button } from '../../shared/Button';

export const WelcomeHero = component$(() => {
  return (
    <section class="h-screen grid place-content-center">
      <h1
        class={
          'lg:mt-[-180px] z-10 text-6xl bg-clip-text text-transparent inline-block bg-gradient-to-b from-cyan-700 to-black animate-in fade-in zoom-in duration-2000'
        }
      >
        GG-Finance
      </h1>

      <div class="flex items-center gap-x-8 gap-y-4 animate-in fade-in duration-2000">
        <Button onClick$={() => console.log('lll')} class="flex-1 text-xl">
          <span>Search</span>
        </Button>
        <Button onClick$={() => console.log('lll')} class="flex-1 text-xl">
          <span>Dashboard</span>
        </Button>
      </div>
    </section>
  );
});
