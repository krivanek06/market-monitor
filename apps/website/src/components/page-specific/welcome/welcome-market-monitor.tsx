import { component$ } from '@builder.io/qwik';
import { CSS_HELPERS } from '../../utils';

export const WelcomeMarketMonitor = component$(() => {
  return (
    <div class="p-10 grid place-content-center">
      <h2 class={CSS_HELPERS.primaryTitle + ' text-6xl text-center'}>Market Monitoring</h2>

      <div class="flex justify-around gap-10 text-gray-300 text-center mt-[100px] mx-auto w-full lg:w-[80%]">
        <p class="p-4">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore corrupti natus maxime debitis, eos
          exercitationem hic perferendis sequi similique ducimus dolorum autem doloribus quod, animi ad eum deserunt,
          odit velit?
        </p>
        <p class="p-4">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore corrupti natus maxime debitis, eos
          exercitationem hic perferendis sequi similique ducimus dolorum autem doloribus quod, animi ad eum deserunt,
          odit velit?
        </p>
      </div>
    </div>
  );
});
