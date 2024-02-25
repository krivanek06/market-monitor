import { component$ } from '@builder.io/qwik';
import { CardBasic, ImagePreview, ImagePreviewProps } from '../../shared';

export const WelcomeInvestmentAccount = component$(() => {
  const images = [
    {
      src: '/images/app-4.png',
      alt: 'Portfolio Growth',
    },
    {
      src: '/images/app-5.png',
      alt: 'Trading',
    },
    {
      src: '/images/app-1.png',
      alt: 'Transactions',
    },
    {
      src: '/images/app-2.png',
      alt: 'Holdings',
    },
    {
      src: '/images/app-3.png',
      alt: 'Allocation Chart',
    },
    {
      src: '/images/app-6.png',
      alt: 'User Ranks',
    },
    {
      src: '/images/app-7.png',
      alt: 'SP500 stats',
    },
    {
      src: '/images/app-8.png',
      alt: 'Treasure Bonds',
    },
    {
      src: '/images/app-9.png',
      alt: 'Dividend Calendar',
    },
    {
      src: '/images/app-10.png',
      alt: 'Advance Stock Search',
    },
    {
      src: '/images/app-11.png',
      alt: 'Groups Info',
    },
  ] satisfies ImagePreviewProps['images'];

  return (
    <section class="p-10 grid place-content-center relative z-10">
      <h2 class="g-section-title">Investment Account</h2>

      <div class="grid grid-cols-3 gap-4 mb-16 lg:px-10">
        <CardBasic>
          <h3 class=" text-xl text-center mb-4 w-full text-cyan-800">Portfolio Growth</h3>
          <p class="text-center p-4 text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime amet quia quos rem voluptas eaque placeat
            minima, quod at nemo cumque aliquid veritatis doloremque dolores! Mollitia magni dolorem facere aspernatur.
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class=" text-xl text-center mb-4 w-full text-cyan-800">Investment Risk</h3>
          <p class="text-center p-4 text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime amet quia quos rem voluptas eaque placeat
            minima, quod at nemo cumque aliquid veritatis doloremque dolores! Mollitia magni dolorem facere aspernatur.
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class=" text-xl text-center mb-4 w-full text-cyan-800">Allocations & Transactions</h3>
          <p class="text-center p-4 text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime amet quia quos rem voluptas eaque placeat
            minima, quod at nemo cumque aliquid veritatis doloremque dolores! Mollitia magni dolorem facere aspernatur.
          </p>
        </CardBasic>
      </div>

      <div class="overflow-auto">
        <ImagePreview images={images} />
      </div>
    </section>
  );
});
