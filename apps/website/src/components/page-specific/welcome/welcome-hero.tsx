import { component$ } from '@builder.io/qwik';
import { Button } from '../../shared/Button';
import { CSS_HELPERS } from '../../utils';

export const WelcomeHero = component$(() => {
  return (
    <section class="w-screen h-screen grid place-content-center">
      <img src="public/images/hero-6.jpeg" class="absolute top-0 w-[100%] h-[70%] object-cover opacity-40" />

      <h1 class={'lg:mt-[-180px] z-10 text-9xl ' + CSS_HELPERS.primaryTitle}>GG-Finance</h1>

      <div class="flex items-center gap-x-8 gap-y-4">
        <Button label="Search" onClick$={() => console.log('lll')} class="flex-1 text-xl" />
        <Button label="Dashboard" onClick$={() => console.log('lll')} class="flex-1 text-xl" />
      </div>
    </section>
  );
});
