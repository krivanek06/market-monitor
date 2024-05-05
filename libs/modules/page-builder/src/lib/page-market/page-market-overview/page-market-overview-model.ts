import { FinancialEconomicTypes, TreasureDataBySections } from '@mm/api-types';

export const treasuryData = [
  {
    key: 'month1',
    chartTitle: '1 month rate',
  },
  {
    key: 'month6',
    chartTitle: '6 month rate',
  },
  {
    key: 'year1',
    chartTitle: '1 year rate',
  },
  {
    key: 'year5',
    chartTitle: '5 year rate',
  },
  {
    key: 'year10',
    chartTitle: '10 year rate',
  },
  {
    key: 'year30',
    chartTitle: '30 year rate',
  },
] satisfies {
  key: keyof TreasureDataBySections;
  chartTitle: string;
}[];

export const economicData = [
  {
    chartTitle: 'GDP',
    key: 'GDP',
    fancyColor: 3,
  },
  {
    chartTitle: 'Real GDP',
    key: 'realGDP',
    fancyColor: 3,
  },
  {
    chartTitle: 'Real GDP Per Capita',
    key: 'realGDPPerCapita',
    fancyColor: 3,
  },
  {
    chartTitle: 'CPI',
    key: 'CPI',
    fancyColor: 4,
  },
  {
    chartTitle: 'Federal Funds',
    key: 'federalFunds',
    fancyColor: 4,
  },
  {
    chartTitle: 'Inflation Rate',
    key: 'inflationRate',
    fancyColor: 4,
  },
  {
    chartTitle: 'Consumer Sentiment',
    key: 'consumerSentiment',
    fancyColor: 3,
  },
  {
    chartTitle: 'Unemployment Rate',
    key: 'unemploymentRate',
    fancyColor: 3,
  },
  {
    chartTitle: 'Retail Sales',
    key: 'retailSales',
    fancyColor: 3,
  },
  {
    chartTitle: 'New Privately-Owned Housing',
    key: 'newPrivatelyOwnedHousingUnitsStartedTotalUnits',
    fancyColor: 4,
  },
  {
    chartTitle: 'Total Vehicle Sales',
    key: 'totalVehicleSales',
    fancyColor: 4,
  },
  {
    chartTitle: '30 Year Fixed Rate Mortgage',
    key: '30YearFixedRateMortgageAverage',
    fancyColor: 4,
  },
] satisfies {
  chartTitle: string;
  key: FinancialEconomicTypes;
  fancyColor: number;
}[];
