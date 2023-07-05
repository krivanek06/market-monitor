import { StockScreenerResults, StockScreenerValues } from '@market-monitor/api-types';
/* eslint-disable max-len */
import {
  AnalystEstimates,
  AnalystEstimatesEarnings,
  CompanyOutlook,
  ESGDataQuarterly,
  ESGDataRatingYearly,
  Earnings,
  HistoricalLoadingPeriods,
  HistoricalPrice,
  News,
  PriceChange,
  PriceTarget,
  Profile,
  SectorPeers,
  SymbolQuote,
  TickerSearch,
  UpgradesDowngrades,
} from '@market-monitor/api-types';
import axios from 'axios';
import { FINANCIAL_MODELING_KEY, FINANCIAL_MODELING_URL } from './environments';

export const getCompanyQuote = async (symbols: string[]): Promise<SymbolQuote[]> => {
  const symbol = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/quote/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<SymbolQuote[]>(url);
  return response.data;
};

export const getProfile = async (symbols: string[]): Promise<Profile[]> => {
  const symbol = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/profile/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<Profile[]>(url);
  return response.data;
};

export const getCompanyOutlook = async (symbol: string): Promise<CompanyOutlook> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/company-outlook?symbol=${symbol}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<CompanyOutlook>(url);
  return response.data;
};

/**
 *
 * @param symbol
 * @param from - YYYY-MM-DD
 * @param to - YYYY-MM-DD
 * @returns array of data [  {
    "date": "2019-03-13 19:59:00",
    "open": 131.16,
    "low": 131.15,
    "high": 134.53,
    "close": 134.51,
    "volume": 8
  }]
 */
export const getHistoricalPrices = async (
  symbol: string,
  period: HistoricalLoadingPeriods,
  from: string,
  to: string
): Promise<HistoricalPrice[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/historical-chart/${period}/${symbol}?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<HistoricalPrice[]>(url);
  return response.data;
};

/**
 *
 * @param symbolPrefix
 * @param isCrypto
 * @returns array of ticker search results [{
    "symbol": "MINAUSD",
    "name": "Mina USD",
    "currency": "USD",
    "stockExchange": "CCC",
    "exchangeShortName": "CRYPTO"
  }]
 */
export const searchTicker = async (symbolPrefix: string, isCrypto = false): Promise<TickerSearch[]> => {
  const stockExchange = 'NASDAQ,NYSE';
  const cryptoExchange = 'CRYPTO';
  const ignoredSymbols = ['.', '-']; // if symbol con any of the ignored symbols, filter them out
  const usedExchange = isCrypto ? cryptoExchange : stockExchange;
  const url = `${FINANCIAL_MODELING_URL}/v3/search-ticker?query=${symbolPrefix}&limit=12&exchange=${usedExchange}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<TickerSearch[]>(url);

  // check if symbol contains any of the ignored symbols
  const filteredResponse = response.data.filter((ticker) => {
    return !ignoredSymbols.some((ignoredSymbol) => ticker.symbol.includes(ignoredSymbol));
  });
  return filteredResponse;
};

/**
 *
 * @param symbol
 * @returns array of historical data [
 *   {
    "symbol": "AAPL",
    "cik": "0000320193",
    "companyName": "Apple Inc.",
    "industry": "ELECTRONIC COMPUTERS",
    "year": 2022,
    "ESGRiskRating": "B",
    "industryRank": "7 out of 7"
  }]
 */
export const getEsgRatingYearly = async (symbol: string): Promise<ESGDataRatingYearly[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/esg-environmental-social-governance-data-ratings?symbol=${symbol}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<ESGDataRatingYearly[]>(url);
  return response.data;
};

/**
 *
 * @param symbol
 * @returns array of historical data [
 *   {
    "symbol": "AAPL",
    "cik": "0000320193",
    "companyName": "Apple Inc.",
    "formType": "10-Q",
    "acceptedDate": "2023-02-02 18:01:30",
    "date": "2022-12-31",
    "environmentalScore": 50,
    "socialScore": 50,
    "governanceScore": 63.3,
    "ESGScore": 54.43,
    "url": "https://www.sec.gov/Archives/edgar/data/320193/000032019323000006/0000320193-23-000006-index.htm"
  }]
 */
export const getEsgDataQuarterly = async (symbol: string): Promise<ESGDataQuarterly[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/esg-environmental-social-governance-data?symbol=${symbol}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<ESGDataQuarterly[]>(url);
  return response.data;
};

/**
 * @param symbol
 * @returns array of historical data [{
    "symbol": "AAPL",
    "publishedDate": "2023-06-06T08:57:00.000Z",
    "newsURL": "https://www.benzinga.com/news/23/06/32736409/apple-to-rally-around-17-here-are-10-other-analyst-forecasts-for-tuesday",
    "newsTitle": "Apple To Rally Around 17%? Here Are 10 Other Analyst Forecasts For Tuesday",
    "newsBaseURL": "benzinga.com",
    "newsPublisher": "Benzinga",
    "newGrade": "Overweight",
    "previousGrade": "Overweight",
    "gradingCompany": "Wells Fargo",
    "action": "hold",
    "priceWhenPosted": 178.6999
 * }]
 */
export const getUpgradesDowngrades = async (symbol: string): Promise<UpgradesDowngrades[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/upgrades-downgrades?symbol=${symbol}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<UpgradesDowngrades[]>(url);
  return response.data;
};

/**
 * @param symbol
 * @returns array of historical data [{
 *   "symbol": "AAPL",
    "publishedDate": "2023-06-06T11:32:00.000Z",
    "newsURL": "https://www.benzinga.com/analyst-ratings/analyst-color/23/06/32739815/apples-vision-pro-price-tag-release-date-find-little-love-on-the-street-why-one-ana",
    "newsTitle": "Apple's Vision Pro Price Tag, Release Date Find Little Love On The Street: Why One Analyst Says Disney Acquisition More Likely After WWDC",
    "analystName": "Laura Martin",
    "priceTarget": 195,
    "adjPriceTarget": 195,
    "priceWhenPosted": 178.8299,
    "newsPublisher": "Benzinga",
    "newsBaseURL": "benzinga.com",
    "analystCompany": "Needham"
 }]
 */
export const getPriceTarget = async (symbol: string): Promise<PriceTarget[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/price-target?symbol=${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<PriceTarget[]>(url);
  return response.data;
};

/**
 * @deprecated - use getAnalystEstimatesEarnings instead
 *
 * @param symbol
 * @returns array of historical data [{
 *  "date": "2023-05-04",
    "symbol": "AAPL",
    "actualEarningResult": 1.52,
    "estimatedEarning": 1.43
 }]
 */
export const getCompanyEarnings = async (symbol: string): Promise<Earnings[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/earnings-surprise/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<Earnings[]>(url);
  return response.data;
};

/**
 * @deprecated - use getAnalystEstimatesEarnings instead
 *
 * @param symbol
 * @param period
 * @returns array of historical data [{
 *  "symbol": "AAPL",
    "date": "2023-12-31",
    "estimatedRevenueLow": 338710374830,
    "estimatedRevenueHigh": 508065562246,
    "estimatedRevenueAvg": 423387968538,
    "estimatedEbitdaLow": 110816277291,
    "estimatedEbitdaHigh": 166224415938,
    "estimatedEbitdaAvg": 138520346615,
    "estimatedEbitLow": 99597027281,
    "estimatedEbitHigh": 149395540924,
    "estimatedEbitAvg": 124496284103,
    "estimatedNetIncomeLow": 83849180538,
    "estimatedNetIncomeHigh": 125773770810,
    "estimatedNetIncomeAvg": 104811475674,
    "estimatedSgaExpenseLow": 20384820993,
    "estimatedSgaExpenseHigh": 30577231491,
    "estimatedSgaExpenseAvg": 25481026242,
    "estimatedEpsAvg": 6.01,
    "estimatedEpsHigh": 7.209999999999999,
    "estimatedEpsLow": 4.81,
    "numberAnalystEstimatedRevenue": 12,
    "numberAnalystsEstimatedEps": 12
 }]
 */
export const getAnalystEstimates = async (
  symbol: string,
  period: 'yearly' | 'quarter' = 'quarter'
): Promise<AnalystEstimates[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/analyst-estimates/${symbol}?period=${period}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<AnalystEstimates[]>(url);
  return response.data;
};

/**
 *
 * @param symbol
 * @returns array of historical data [{
 *   {
    "date": "2023-07-24",
    "symbol": "MSFT",
    "eps": null,
    "epsEstimated": 2.56,
    "time": "amc",
    "revenue": null,
    "revenueEstimated": 55438500000,
    "updatedFromDate": "2023-06-09",
    "fiscalDateEnding": "2023-07-01"
  }]
 */
export const getAnalystEstimatesEarnings = async (symbol: string): Promise<AnalystEstimatesEarnings[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/historical/earning_calendar/${symbol}?limit=80&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<AnalystEstimatesEarnings[]>(url);
  // last 3 data have null as epsEstimated
  return response.data.filter((d) => !!d.epsEstimated);
};

/**
 *
 * @param symbols
 * @returns array of data [
 *{
    "symbol": "AAPL",
    "peersList": ["LPL", ...]
  },
  {
    "symbol": "MSFT",
    "peersList": ["LPL", ...]
  }]
 */
export const getSectorPeersForSymbols = async (symbols: string[]): Promise<SectorPeers[]> => {
  const symbolString = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v4/stock_peers?symbol=${symbolString}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<SectorPeers[]>(url);
  return response.data;
};

/**
 *
 * @param symbols
 * @returns array of percentage data
 * ```JSON
 * [{
      "symbol": "AAPL",
      "1D": 0.6523,
      "5D": 0.39650887,
      "1M": 5.95516,
      "3M": 20.85743,
      "6M": 28.21965,
      "ytd": 45.74005,
      "1Y": 28.17796,
      "3Y": 115.25808,
      "5Y": 297.79824,
      "10Y": 1235.5288,
      "max": 182407.02924
  }]
  ```
 */
export const getSymbolsPriceChanges = async (symbols: string[]): Promise<PriceChange[]> => {
  const symbolString = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/stock-price-change/${symbolString}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<PriceChange[]>(url);
  return response.data;
};

export const getSymbolPrice = async (symbol: string): Promise<PriceChange> => {
  const response = await getSymbolsPriceChanges([symbol]);
  return response[0];
};

/**
 *
 * @param symbol
 * @returns array of data [{
    "symbol": "AAPL",
    "publishedDate": "2023-06-09 08:07:00",
    "title": "A Bull Market Is Coming: 2 Reasons to Buy Apple Stock",
    "image": "https://cdn.snapi.dev/images/v1/s/0/105852533-1555339384013gettyimages-1089723090530x298-1928008.jpeg",
    "site": "The Motley Fool",
    "text": "Apple's Worldwide Developer Conference revealed a number of new products on June 5. However, the biggest announcement was its Vision Pro, an upcoming VR/AR headset.",
    "url": "https://www.fool.com/investing/2023/06/09/a-bull-market-is-coming-2-reasons-to-buy-apple-sto/"
  }]
 */
export const getStockNews = async (symbol: string): Promise<News[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/stock_news?tickers=${symbol}&limit=15&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<News[]>(url);
  return response.data;
};

/**
 *
 * @param values
 * @returns an URLSearchParams from the provided StockScreenerValues object. Ignores keys that are
 * not part of the object
 */
const getStockScreeningSearchParams = (values: StockScreenerValues): URLSearchParams => {
  const searchParams = new URLSearchParams({});
  if (values.country) {
    searchParams.append('country', values.country);
  }
  if (values.sector) {
    searchParams.append('sector', values.sector);
  }
  if (values.industry) {
    searchParams.append('industry', values.industry);
  }
  if (values.exchange) {
    searchParams.append('exchange', values.exchange);
  }
  if (values.marketCap) {
    const [marketCapMoreThan, marketCapLowerThan] = values.marketCap;
    if (marketCapMoreThan) {
      searchParams.append('marketCapMoreThan', String(marketCapMoreThan));
    }
    if (marketCapLowerThan) {
      searchParams.append('marketCapLowerThan', String(marketCapLowerThan));
    }
  }

  if (values.price) {
    const [priceMoreThan, priceLowerThan] = values.price;
    if (priceMoreThan) {
      searchParams.append('priceMoreThan', String(priceMoreThan));
    }
    if (priceLowerThan) {
      searchParams.append('priceLowerThan', String(priceLowerThan));
    }
  }

  if (values.volume) {
    const [volumeMoreThan, volumeLowerThan] = values.volume;
    if (volumeMoreThan) {
      searchParams.append('volumeMoreThan', String(volumeMoreThan));
    }
    if (volumeLowerThan) {
      searchParams.append('volumeLowerThan', String(volumeLowerThan));
    }
  }

  if (values.dividends) {
    const [dividendMoreThan, dividendLowerThan] = values.dividends;
    if (dividendMoreThan) {
      searchParams.append('dividendMoreThan', String(dividendMoreThan));
    }
    if (dividendLowerThan) {
      searchParams.append('dividendLowerThan', String(dividendLowerThan));
    }
  }

  return searchParams;
};
export const getStockScreening = async (values: StockScreenerValues): Promise<StockScreenerResults[]> => {
  const searchParams = getStockScreeningSearchParams(values);
  const searchParamsValues = String(searchParams).length > 0 ? `${searchParams}&` : '';
  const ignoredSymbols = ['.', '-']; // if symbol con any of the ignored symbols, filter them out

  const url = `${FINANCIAL_MODELING_URL}/v3/stock-screener?${searchParamsValues}limit=300&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<StockScreenerResults[]>(url);

  // check if symbol contains any of the ignored symbols
  const filteredResponse = response.data
    .filter((screenerData) => {
      return !ignoredSymbols.some((ignoredSymbol) => screenerData.symbol.includes(ignoredSymbol));
    })
    .filter((d) => !d.isEtf && !!d.sector);
  return filteredResponse;
};
