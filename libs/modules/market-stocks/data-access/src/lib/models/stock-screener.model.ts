import {
  StockExchangeTypes,
  StockIndustryTypes,
  StockScreenerArray,
  StockScreenerValues,
  StockSectorTypes,
} from '@market-monitor/api-types';
import { InputSource } from '@market-monitor/shared/data-access';

export const STOCK_SCREENER_COUNTRIES: InputSource<string | null>[] = [
  { value: null, caption: 'All' },
  { value: 'USA', caption: 'United States' },
  { value: 'AT', caption: 'Austria' },
  { value: 'AU', caption: 'Australia' },
  { value: 'BE', caption: 'Belgium' },
  { value: 'BR', caption: 'Brazil' },
  { value: 'CA', caption: 'Canada' },
  { value: 'DK', caption: 'Denmark' },
  { value: 'FI', caption: 'Finland' },
  { value: 'FR', caption: 'France' },
  { value: 'DE', caption: 'Germany' },
  { value: 'HK', caption: 'Hong Kong' },
  { value: 'IE', caption: 'Ireland' },
  { value: 'IN', caption: 'India' },
  { value: 'IT', caption: 'Italy' },
  { value: 'JP', caption: 'Japan' },
  { value: 'NL', caption: 'Netherlands' },
  { value: 'NZ', caption: 'New Zealand' },
  { value: 'NO', caption: 'Norway' },
  { value: 'PT', caption: 'Portugal' },
  { value: 'ES', caption: 'Spain' },
  { value: 'SG', caption: 'Singapore' },
  { value: 'CH', caption: 'Switzerland' },
  { value: 'SE', caption: 'Sweden' },
  { value: 'GB', caption: 'United Kingdom' },
];

export const STOCK_SCREENER_INDUSTRIES: InputSource<StockIndustryTypes | null>[] = [
  { value: null, caption: 'All' },
  { value: 'Autos', caption: 'Autos' },
  { value: 'Banks', caption: 'Banks' },
  { value: 'Banks Diversified', caption: 'Banks Diversified' },
  { value: 'Software', caption: 'Software' },
  { value: 'Banks Regional', caption: 'Banks Regional' },
  { value: 'Beverages Alcoholic', caption: 'Beverages Alcoholic' },
  { value: 'Beverages Brewers', caption: 'Beverages Brewers' },
  { value: 'Beverages Non-Alcoholic', caption: 'Beverages Non-Alcoholic' },
];
export const STOCK_SCREENER_SECTORS: InputSource<StockSectorTypes | null>[] = [
  { value: null, caption: 'All' },
  { value: 'Consumer Cyclical', caption: 'Consumer Cyclical' },
  { value: 'Energy', caption: 'Energy' },
  { value: 'Technology', caption: 'Technology' },
  { value: 'Industrials', caption: 'Industrials' },
  { value: 'Financial Services', caption: 'Financial Services' },
  { value: 'Basic Materials', caption: 'Basic Materials' },
  { value: 'Communication Services', caption: 'Communication Services' },
  { value: 'Consumer Defensive', caption: 'Consumer Defensive' },
  { value: 'Healthcare', caption: 'Healthcare' },
  { value: 'Real Estate', caption: 'Real Estate' },
  { value: 'Utilities', caption: 'Utilities' },
  { value: 'Industrial Goods', caption: 'Industrial Goods' },
  { value: 'Financial', caption: 'Financial' },
  { value: 'Services', caption: 'Services' },
  { value: 'Conglomerates', caption: 'Conglomerates' },
];

export const STOCK_SCREENER_EXCHANGE: InputSource<StockExchangeTypes | null>[] = [
  { value: null, caption: 'All' },
  { value: 'amex', caption: 'AMEX' },
  { value: 'nasdaq', caption: 'NASDAQ' },
  { value: 'nyse', caption: 'NYSE' },
];

export const STOCK_SCREENER_MARKET_CAP: InputSource<StockScreenerArray>[] = [
  { value: null, caption: 'All' },
  { value: [200_000_000_000, null], caption: 'Mega ($200bln and more)' },
  { value: [50_000_000_000, 200_000_000_000], caption: 'Large ($50bln to $200bln)' },
  { value: [15_000_000_000, 50_000_000_000], caption: 'Large ($15bln to $50bln)' },
  { value: [5_000_000_000, 15_000_000_000], caption: 'Mid + ($5bln to $15bln)' },
  { value: [3_000_000_000, 5_000_000_000], caption: 'Mid ($3bln to $5bln)' },
  { value: [1_000_000_000, 3_000_000_000], caption: 'Small+ ($1bln to $3bln)' },
  { value: [500_000_000, 1_000_000_000], caption: 'Small ($500mln to $1bln)' },
  { value: [200_000_000, 500_000_000], caption: 'Micro+ ($200mln to $500mln)' },
  { value: [500_000_000, 200_000_000], caption: 'Micro ($50mln to $200mln)' },
  { value: [30_000_000, 50_000_000], caption: 'Nano+ ($30mln than $50mln)' },
  { value: [null, 30_000_00], caption: 'Nano (less than $30mln)' },
];
export const STOCK_SCREENER_PRICE: InputSource<StockScreenerArray>[] = [
  { value: null, caption: 'All' },
  { value: [200, null], caption: 'Over $200' },
  { value: [100, 200], caption: '$100 to $200' },
  { value: [50, 100], caption: '$50 to $100' },
  { value: [20, 50], caption: '$20 to $50' },
  { value: [10, 20], caption: '$10 to $20' },
  { value: [5, 10], caption: '$5 to $10' },
  { value: [2, 5], caption: '$2 to $5' },
  { value: [1, 2], caption: '$1 to $2' },
  { value: [null, 1], caption: 'Under $1' },
];
export const STOCK_SCREENER_VOLUME: InputSource<StockScreenerArray>[] = [
  { value: null, caption: 'All' },
  { value: [100_000_000, null], caption: 'Over 100M' },
  { value: [50_000_000, 100_000_000], caption: '50M to 100M' },
  { value: [20_000_000, 50_000_000], caption: '20M to 50M' },
  { value: [10_000_000, 20_000_000], caption: '10M to 20M' },
  { value: [5_000_000, 10_000_000], caption: '5M to 10M' },
  { value: [2_000_000, 5_000_000], caption: '2M to 5M' },
  { value: [1_000_000, 2_000_000], caption: '1M to 2M' },
  { value: [500_000, 1_000_000], caption: '500K to 1M' },
  { value: [200_000, 500_000], caption: '200K to 500K' },
  { value: [100_000, 200_000], caption: '100K to 200K' },
  { value: [50_000, 100_000], caption: '50K to 100K' },
  { value: [20_000, 50_000], caption: '20K to 50K' },
  { value: [null, 20_000], caption: 'under 20K' },
];
export const STOCK_SCREENER_DIVIDENDS: InputSource<StockScreenerArray>[] = [
  { value: null, caption: 'All' },
  { value: [3, null], caption: 'Over $3' },
  { value: [2, 3], caption: '$2 to $3' },
  { value: [1, 2], caption: '$1 to $2' },
  { value: [0.5, 1], caption: '$0.5 to $1' },
  { value: [0.1, 0.5], caption: '$0.1 to $0.5' },
  { value: [null, 0.1], caption: 'Under $0.1' },
];

export const STOCK_SCREENER_DEFAULT_VALUES: StockScreenerValues = {
  country: null,
  industry: null,
  sector: null,
  exchange: null,
  marketCap: STOCK_SCREENER_MARKET_CAP[1].value,
  price: null,
  volume: null,
  dividends: null,
};

export const STOCK_SCREENER_INPUT_SOURCE_TO_KEY: { [key in keyof StockScreenerValues]: InputSource<unknown>[] } = {
  country: STOCK_SCREENER_COUNTRIES,
  industry: STOCK_SCREENER_INDUSTRIES,
  sector: STOCK_SCREENER_SECTORS,
  exchange: STOCK_SCREENER_EXCHANGE,
  marketCap: STOCK_SCREENER_MARKET_CAP,
  price: STOCK_SCREENER_PRICE,
  volume: STOCK_SCREENER_VOLUME,
  dividends: STOCK_SCREENER_DIVIDENDS,
};

export const getScreenerInputIndexByKey = (key: keyof StockScreenerValues, value: unknown): number => {
  const inputSource = STOCK_SCREENER_INPUT_SOURCE_TO_KEY[key];
  return inputSource.findIndex((item) => item.value === value);
};

export const getScreenerInputValueByKey = (key: keyof StockScreenerValues, index: number): unknown | null => {
  const inputSource = STOCK_SCREENER_INPUT_SOURCE_TO_KEY[key];
  return inputSource[index]?.value ?? null;
};
