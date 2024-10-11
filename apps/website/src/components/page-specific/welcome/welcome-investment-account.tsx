import { component$ } from '@builder.io/qwik';
import { CardBasic, ImagePreview, ImagePreviewProps } from '../../shared';

export const WelcomeInvestmentAccount = component$(() => {
  const images = [
    {
      src: `images/application/app-1.webp`,
      alt: 'Portfolio Growth',
    },
    {
      src: `images/application/app-10.webp`,
      alt: 'Portfolio Daily Change',
    },
    {
      src: `images/application/app-11.webp`,
      alt: 'Portfolio Allocation',
    },
    {
      src: `images/application/app-3.webp`,
      alt: 'Asset Growth',
    },
    {
      src: `images/application/app-4.webp`,
      alt: 'Symbol Summary',
    },
    {
      src: `images/application/app-5.webp`,
      alt: 'Transaction History',
    },
    {
      src: `images/application/app-6.webp`,
      alt: 'User Ranks',
    },
    {
      src: `images/application/app-7.webp`,
      alt: 'User Details',
    },
    {
      src: `images/application/app-8.webp`,
      alt: 'User Comparison',
    },
    {
      src: `images/application/app-9.webp`,
      alt: 'Trading',
    },
    {
      src: `images/application/app-12.webp`,
      alt: 'Asset Statistics',
    },
    {
      src: `images/application/app-13.webp`,
      alt: 'Asset Statistics',
    },
  ] satisfies ImagePreviewProps['images'];

  return (
    <section class="relative z-10 grid place-content-center">
      <h2 class="g-section-title">Investment Account</h2>

      <div class="mb-8 grid gap-x-4 gap-y-8 pt-4 md:mb-16 md:grid-cols-3 lg:px-10">
        <CardBasic>
          <h3 class="mb-2 w-full text-center text-xl text-cyan-600">Portfolio Growth</h3>
          <p class="p-4 text-center text-lg text-gray-300">
            Monitor your portfolio against indexes, see in-depth details of your holdings and view your last
            transactions
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class="mb-2 w-full text-center text-xl text-cyan-600">Investment Risk</h3>
          <p class="p-4 text-center text-lg text-gray-300">
            Have you ever wondered how risky your portfolio is? Use us to see your portfolio's risk and how it compares
          </p>
        </CardBasic>
        <CardBasic>
          <h3 class="mb-2 w-full text-center text-xl text-cyan-600">Allocations & Transactions</h3>
          <p class="p-4 text-center text-lg text-gray-300">
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
