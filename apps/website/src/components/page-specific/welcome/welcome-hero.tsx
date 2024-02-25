import { component$ } from '@builder.io/qwik';
import { Button } from '../../shared/Button';
import { CSS_HELPERS } from '../../utils';

export const WelcomeHero = component$(() => {
  return (
    <section class="h-screen grid place-content-center">
      <h1 class={'lg:mt-[-180px] z-10 text-9xl ' + CSS_HELPERS.primaryTitle}>GG-Finance</h1>

      <div class="flex items-center gap-x-8 gap-y-4">
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
