export type ImageProps = { src: string; alt: string };

export const investmentAccountImages = [
  {
    src: `assets/application/app-1.webp`,
    alt: 'Portfolio Growth',
  },
  {
    src: `assets/application/app-10.webp`,
    alt: 'Portfolio Daily Change',
  },
  {
    src: `assets/application/app-11.webp`,
    alt: 'Portfolio Allocation',
  },
  {
    src: `assets/application/app-3.webp`,
    alt: 'Asset Growth',
  },
  {
    src: `assets/application/app-4.webp`,
    alt: 'Symbol Summary',
  },
  {
    src: `assets/application/app-5.webp`,
    alt: 'Transaction History',
  },
  {
    src: `assets/application/app-6.webp`,
    alt: 'User Ranks',
  },
  {
    src: `assets/application/app-7.webp`,
    alt: 'User Details',
  },
  {
    src: `assets/application/app-8.webp`,
    alt: 'User Comparison',
  },
  {
    src: `assets/application/app-9.webp`,
    alt: 'Trading',
  },
  {
    src: `assets/application/app-12.webp`,
    alt: 'Asset Statistics',
  },
  {
    src: `assets/application/app-13.webp`,
    alt: 'Asset Statistics',
  },
] as const satisfies ImageProps[];
