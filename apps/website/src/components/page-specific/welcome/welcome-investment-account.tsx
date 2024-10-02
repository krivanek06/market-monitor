import { component$ } from '@builder.io/qwik';
import { CardBasic, ImagePreview, ImagePreviewProps } from '../../shared';
import { websiteImageUrls } from '../../utils';

export const WelcomeInvestmentAccount = component$(() => {
  const images = [
    {
      src: `${websiteImageUrls}/app-4.webp`,
      alt: 'Portfolio Growth',
    },
    {
      src: `${websiteImageUrls}/app-5.webp`,
      alt: 'Trading',
    },
    {
      src: `${websiteImageUrls}/app-1.webp`,
      alt: 'Transactions',
    },
    {
      src: `${websiteImageUrls}/app-2.webp`,
      alt: 'Holdings',
    },
    {
      src: `${websiteImageUrls}/app-3.webp`,
      alt: 'Allocation Chart',
    },
    {
      src: `${websiteImageUrls}/app-6.webp`,
      alt: 'User Ranks',
    },
    {
      src: `${websiteImageUrls}/app-7.webp`,
      alt: 'SP500 stats',
    },
    {
      src: `${websiteImageUrls}/app-8.webp`,
      alt: 'Treasure Bonds',
    },
    {
      src: `${websiteImageUrls}/app-9.webp`,
      alt: 'Dividend Calendar',
    },
    {
      src: `${websiteImageUrls}/app-10.webp`,
      alt: 'Advance Stock Search',
    },
    {
      src: `${websiteImageUrls}/app-11.webp`,
      alt: 'Groups Info',
    },
  ] satisfies ImagePreviewProps['images'];

  return (
    <section class="relative z-10 grid place-content-center">
      <h2 class="g-section-title">Investment Account</h2>

      <div class="mb-8 grid gap-x-4 gap-y-8 pt-4 md:mb-16 md:grid-cols-3 lg:px-10">
        <CardBasic>
          <h3 class="mb-2 w-full text-center text-xl text-cyan-700">Portfolio Growth</h3>
          <p class="p-4 text-center text-lg text-gray-400">
            Monitor your portfolio against indexes, see in-depth details of your holdings and view your last
            transactions
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class="mb-2 w-full text-center text-xl text-cyan-700">Investment Risk</h3>
          <p class="p-4 text-center text-lg text-gray-400">
            Have you ever wondered how risky your portfolio is? Use us to see your portfolio's risk and how it compares
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class="mb-2 w-full text-center text-xl text-cyan-700">Allocations & Transactions</h3>
          <p class="p-4 text-center text-lg text-gray-400">
            See your portfolio's allocation, your transactions, and your performance over time.
          </p>
        </CardBasic>
      </div>

      <div class="hidden overflow-auto md:block">
        <ImagePreview images={images} />
      </div>
    </section>
  );
});
