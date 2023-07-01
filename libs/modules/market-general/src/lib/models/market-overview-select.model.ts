import { MARKET_OVERVIEW_DATABASE_KEYS, MarketOverviewDatabaseKeys } from '@market-monitor/api-types';

type MarketOverviewDataLocalData = {
  name: string;
  subKey: string;
};
type MarketOverviewDataLocal<T extends MarketOverviewDatabaseKeys> = {
  name: string;
  key: T;
  data: MarketOverviewDataLocalData[];
};

const sp500: MarketOverviewDataLocal<'sp500'> = {
  name: 'S&P 500',
  key: 'sp500',
  data: [
    {
      name: 'S&P 500 - PE ratio',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.peRatio,
    },
    {
      name: 'S&P 500 - Shiller PE',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.shillerPeRatio,
    },
    {
      name: 'S&P 500 - Book value',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.bookValue,
    },
    {
      name: 'S&P 500 - Price to book',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToBook,
    },
    {
      name: 'S&P 500 - Sales',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.sales,
    },
    {
      name: 'S&P 500 - Sales growth',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.salesGrowth,
    },
    {
      name: 'S&P 500 - Price to sale',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToSales,
    },
    {
      name: 'S&P 500 - Earnings',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earnings,
    },
    {
      name: 'S&P 500 - Earnings growth',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsGrowth,
    },
    {
      name: 'S&P 500 - Earnings yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsYield,
    },
    {
      name: 'S&P 500 - Dividend yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendYield,
    },
    {
      name: 'S&P 500 - Dividend',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividend,
    },
    {
      name: 'S&P 500 - Dividend growth',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendGrowth,
    },
  ],
};

const bonds: MarketOverviewDataLocal<'bonds'> = {
  name: 'Bonds',
  key: 'bonds',
  data: [
    {
      name: 'Bond - US AAA yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAAYield,
    },
    {
      name: 'Bond - US AA yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAYield,
    },
    {
      name: 'Bond - US A yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAYield,
    },
    {
      name: 'Bond - US BB yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBBYield,
    },
    {
      name: 'Bond - US B yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBYield,
    },
    {
      name: 'Bond - US CCC yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCCCYield,
    },
    {
      name: 'Bond - US Corporate yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCorporateYield,
    },
    {
      name: 'Bond - US high yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usHighYield,
    },
    {
      name: 'Bond - Emerging markets high yield',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bonds.usEmergingMarket,
    },
  ],
};

const treasury: MarketOverviewDataLocal<'treasury'> = {
  name: 'Treasury yield',
  key: 'treasury',
  data: [
    {
      name: 'Treasury yield 1 MO',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Month,
    },
    {
      name: 'Treasury yield 2 MO',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Month,
    },
    {
      name: 'Treasury yield 3 MO',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Month,
    },
    {
      name: 'Treasury yield 6 MO',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us6Month,
    },
    {
      name: 'Treasury yield 1 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Year,
    },
    {
      name: 'Treasury yield 2 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us2Year,
    },
    {
      name: 'Treasury yield 3 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Year,
    },
    {
      name: 'Treasury yield 5 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us5Year,
    },
    {
      name: 'Treasury yield 7 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us7Year,
    },
    {
      name: 'Treasury yield 10 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us10Year,
    },
    {
      name: 'Treasury yield 20 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us20Year,
    },
    {
      name: 'Treasury yield 30 YR',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.treasury.us30Year,
    },
  ],
};

const consumerPriceIndex: MarketOverviewDataLocal<'consumerIndex'> = {
  name: 'Consumer price index states',
  key: 'consumerIndex',
  data: [
    {
      name: 'Consumer price index - USA',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.usCpi,
    },
    {
      name: 'Consumer price index - Europe',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.euCpi,
    },
    {
      name: 'Consumer price index - UK',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.ukCpi,
    },
    {
      name: 'Consumer price index - Japan',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.jpCpi,
    },
    {
      name: 'Consumer price index - Canada',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.caCpi,
    },
    {
      name: 'Consumer price index - Switzerland',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.cheCpi,
    },
    {
      name: 'Consumer price index - Russia',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.rusCpi,
    },
    {
      name: 'Consumer price index - Australia',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.ausCpi,
    },
    {
      name: 'Consumer price index - Germany',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.gerCpi,
    },
    {
      name: 'Consumer price index - France',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.fraCpi,
    },
    {
      name: 'Consumer price index - Italy',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.itaCpi,
    },
    {
      name: 'Consumer price index - New Zealand',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.nzlCpi,
    },
  ],
};

const inflationRate: MarketOverviewDataLocal<'inflationRate'> = {
  name: 'Inflation rate',
  key: 'inflationRate',
  data: [
    {
      name: 'Inflation YOY - USA',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.usInflationRate,
    },
    {
      name: 'Inflation YOY - Europe',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.euInflationRate,
    },
    {
      name: 'Inflation YOY - UK',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ukInflationRate,
    },
    {
      name: 'Inflation YOY - Canada',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.caInflationRate,
    },
    {
      name: 'Inflation YOY - Japan',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.jpInflationRate,
    },
    {
      name: 'Inflation YOY - Switzerland',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.cheInflationRate,
    },
    {
      name: 'Inflation YOY - Russia',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.rusInflationRate,
    },
    {
      name: 'Inflation YOY - Australia',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ausInflationRate,
    },
    {
      name: 'Inflation YOY - Germany',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.gerInflationRate,
    },
    {
      name: 'Inflation YOY - France',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.fraInflationRate,
    },
    {
      name: 'Inflation YOY - Italy',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.itaInflationRate,
    },
    {
      name: 'Inflation YOY - New Zealand',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.nzlInflationRate,
    },
  ],
};

const bitcoin: MarketOverviewDataLocal<'bitcoin'> = {
  name: 'Bitcoin',
  key: 'bitcoin',
  data: [
    {
      name: 'Market cap',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.marketCap,
    },
    {
      name: 'Traiding volume',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.tradingVolume,
    },
    {
      name: 'Transaction fees',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionFees,
    },
    {
      name: 'Transaction time',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionTime,
    },
    {
      name: 'Transaction cost',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.transactionCost,
    },
    {
      name: 'Daily transactions',
      subKey: MARKET_OVERVIEW_DATABASE_KEYS.bitcoin.dailyTransactions,
    },
  ],
};

export const MARKET_OVERVIEW_DATA = [sp500, bonds, treasury, consumerPriceIndex, inflationRate, bitcoin] as const;

export const getMarketOverKeyBySubKey = <T extends MarketOverviewDatabaseKeys>(
  subKey: string
): {
  key: T;
  name: string;
  subKey: string;
} | null => {
  const key = Object.keys(MARKET_OVERVIEW_DATABASE_KEYS).find((key) => {
    const subKeys = MARKET_OVERVIEW_DATABASE_KEYS[key as T];
    return Object.keys(subKeys).includes(String(subKey));
  }) as T;
  const additionalDataArray = MARKET_OVERVIEW_DATA.find((data) => data.key === key);
  const additionalData = additionalDataArray?.data.find((data) => data.subKey === subKey);

  if (!additionalData) {
    return null;
  }

  return {
    key,
    name: additionalData.name,
    subKey: additionalData.subKey,
  };
};
