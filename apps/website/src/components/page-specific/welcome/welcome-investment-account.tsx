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
    <section class="grid place-content-center relative z-10">
      <h2 class="g-section-title">Investment Account</h2>

      <div class="grid md:grid-cols-3 gap-4 mb-8 md:mb-16 lg:px-10">
        <CardBasic>
          <h3 class=" text-xl text-center mb-4 w-full text-cyan-800">Portfolio Growth</h3>
          <p class="text-center p-4 text-lg">
            Monitor your portfolio against indexes, see in-depth details of your holdings and view your last
            transactions
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class=" text-xl text-center mb-4 w-full text-cyan-800">Investment Risk</h3>
          <p class="text-center p-4 text-lg">
            Have you ever wondered how risky your portfolio is? Use us to see your portfolio's risk and how it compares
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class=" text-xl text-center mb-4 w-full text-cyan-800">Allocations & Transactions</h3>
          <p class="text-center p-4 text-lg">
            See your portfolio's allocation, your transactions, and your performance over time.
          </p>
        </CardBasic>
      </div>

      <div class="overflow-auto hidden md:block">
        <ImagePreview images={images} />
      </div>
    </section>
  );
});
