import { component$ } from '@builder.io/qwik';
import { CardBasic, ImagePreview } from '../../shared';
import { CSS_HELPERS } from '../../utils';

export const WelcomeInvestmentAccount = component$(() => {
  const images = [
    '/images/app-1.png',
    '/images/app-2.png',
    '/images/app-3.png',
    '/images/app-4.png',
    '/images/app-5.png',
    '/images/app-6.png',
    '/images/app-7.png',
    '/images/app-8.png',
    '/images/app-9.png',
    '/images/app-10.png',
    '/images/app-11.png',
  ];

  return (
    <div class="p-10 grid place-content-center">
      <h2 class={CSS_HELPERS.primaryTitle + ' text-7xl text-center mb-[100px]'}>Investment Account</h2>

      <div class="grid grid-cols-3 gap-4 mb-14">
        <CardBasic>
          <h3 class={CSS_HELPERS.primaryTitle + ' text-2xl text-center mb-4 w-full'}>Portfolio Growth</h3>
          <p class="text-center p-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime amet quia quos rem voluptas eaque placeat
            minima, quod at nemo cumque aliquid veritatis doloremque dolores! Mollitia magni dolorem facere aspernatur.
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class={CSS_HELPERS.primaryTitle + ' text-2xl text-center mb-4 w-full'}>Investment Risk</h3>
          <p class="text-center p-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime amet quia quos rem voluptas eaque placeat
            minima, quod at nemo cumque aliquid veritatis doloremque dolores! Mollitia magni dolorem facere aspernatur.
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class={CSS_HELPERS.primaryTitle + ' text-2xl text-center mb-4 w-full'}>Allocation, Transaction & more</h3>
          <p class="text-center p-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime amet quia quos rem voluptas eaque placeat
            minima, quod at nemo cumque aliquid veritatis doloremque dolores! Mollitia magni dolorem facere aspernatur.
          </p>
        </CardBasic>
      </div>

      <div>
        <ImagePreview images={images} />
      </div>
    </div>
  );
});
