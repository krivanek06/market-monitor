/* eslint-disable max-len */
import {
  AnalystEstimates,
  AvailableQuotes,
  CalendarDividend,
  CalendarStockEarning,
  CalendarStockIPO,
  CompanyInsideTrade,
  CompanyKeyMetrics,
  CompanyKeyMetricsTTM,
  CompanyOutlook,
  CompanyProfile,
  CompanyRatio,
  CompanyStockDividend,
  DataDateValue,
  DataSelection,
  DataTimePeriod,
  ESGDataQuarterly,
  ESGDataRatingYearly,
  Earnings,
  EnterpriseValue,
  FinancialEconomicTypes,
  HistoricalLoadingPeriods,
  HistoricalLoadingPeriodsDates,
  HistoricalPrice,
  HistoricalPriceAPI,
  IsStockMarketOpen,
  IsStockMarketOpenExtend,
  MostPerformingStocks,
  News,
  NewsTypes,
  PriceChange,
  PriceTarget,
  SectorPeers,
  StockEarning,
  StockScreenerResults,
  StockScreenerValues,
  SymbolOwnershipHolders,
  SymbolOwnershipInstitutional,
  SymbolQuote,
  TickerSearch,
  TreasuryRates,
  UpgradesDowngrades,
} from '@mm/api-types';
import { format, startOfYear, subDays, subYears } from 'date-fns';
import { FINANCIAL_MODELING_KEY, FINANCIAL_MODELING_URL } from './environments';
import { filterOutSymbols, getDateRangeByMonthAndYear } from './helpers';

export const getCompanyQuote = async (symbols: string[]): Promise<SymbolQuote[]> => {
  const symbol = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/quote/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as SymbolQuote[];
  return data;
};

export const getProfile = async (symbols: string[]): Promise<CompanyProfile[]> => {
  const symbol = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/profile/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyProfile[];
  return data;
};

export const getCompanyOutlook = async (symbol: string): Promise<CompanyOutlook> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/company-outlook?symbol=${symbol}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyOutlook;
  return data;
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
  to: string,
): Promise<HistoricalPrice[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/historical-chart/${period}/${symbol}?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as HistoricalPrice[];
  return data;
};

export const getHistoricalPricesByPeriod = async (
  symbol: string,
  loadingPeriod: HistoricalLoadingPeriodsDates,
): Promise<HistoricalPrice[]> => {
  const historicalPriceData = await getHistoricalPrices(
    symbol,
    loadingPeriod.loadingPeriod,
    loadingPeriod.from,
    loadingPeriod.to,
  );

  // format to correct type
  const result = historicalPriceData.map(
    (d) =>
      ({
        date: d.date,
        close: d.close,
        volume: d.volume,
      }) satisfies HistoricalPrice,
  );

  return result;
};

/**
 * can return null value if date is before IPO
 *
 * @param symbol
 * @param date format YYYY-MM-DD
 * @returns
 */
export const getHistoricalPricesOnDateRange = async (
  symbol: string,
  dateStart: string,
  dateEnd: string,
): Promise<HistoricalPrice[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/historical-price-full/${symbol}?from=${dateStart}&to=${dateEnd}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as { historical: HistoricalPriceAPI[] };

  if (!('historical' in data) || (data.historical as HistoricalPriceAPI[]).length === 0) {
    return [];
  }

  const historicalData = data.historical.map((d) => ({
    close: d.close,
    date: d.date,
    volume: d.volume,
  })) satisfies HistoricalPrice[];

  return historicalData;
};

/**
 * can return null value if date is before IPO
 *
 * @param symbol
 * @param date format YYYY-MM-DD
 * @returns
 */
export const getHistoricalPricesOnDate = async (symbol: string, date: string): Promise<HistoricalPrice | null> => {
  const data = await getHistoricalPricesOnDateRange(symbol, date, date);
  return data[0] ?? null;
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
  const response = await fetch(url);
  const data = (await response.json()) as ESGDataRatingYearly[];
  return data;
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
  const response = await fetch(url);
  const data = (await response.json()) as ESGDataQuarterly[];
  return data;
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
  const response = await fetch(url);
  const data = (await response.json()) as UpgradesDowngrades[];
  return data;
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
  const url = `${FINANCIAL_MODELING_URL}/v4/price-target?symbol=${symbol}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as PriceTarget[];
  return data;
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
  const response = await fetch(url);
  const data = (await response.json()) as Earnings[];
  return data;
};

/**
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
  period: DataTimePeriod = 'quarter',
): Promise<AnalystEstimates[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/analyst-estimates/${symbol}?period=${period}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as AnalystEstimates[];
  return data;
};

export const getCompanyKeyMetricsTTM = async (symbol: string): Promise<CompanyKeyMetricsTTM> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/key-metrics-ttm/${symbol}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyKeyMetricsTTM[];
  return data[0];
};

export const getCompanyKeyMetrics = async (
  symbol: string,
  period: DataTimePeriod = 'quarter',
): Promise<CompanyKeyMetrics[]> => {
  const limit = period === 'quarter' ? 60 : 30;
  const url = `${FINANCIAL_MODELING_URL}/v3/key-metrics/${symbol}?period=${period}&limit=${limit}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyKeyMetrics[];
  return data;
};

export const getCompanyRatios = async (symbol: string, period: DataTimePeriod = 'quarter'): Promise<CompanyRatio[]> => {
  const limit = period === 'quarter' ? 60 : 30;
  const url = `${FINANCIAL_MODELING_URL}/v3/ratios/${symbol}?period=${period}&limit=${limit}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyRatio[];
  return data;
};

export const getEnterpriseValue = async (symbol: string): Promise<EnterpriseValue[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/enterprise-values/${symbol}?period=quarter&limit=35&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as EnterpriseValue[];
  return data;
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
export const getStockHistoricalEarnings = async (symbol: string): Promise<StockEarning[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v3/historical/earning_calendar/${symbol}?limit=50&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as StockEarning[];
  // remove first 3 items if epsEstimated is undefined
  const filteredResponse = data.slice(0, 3).filter((item) => item.epsEstimated);
  return [...data.slice(3), ...filteredResponse];
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
  const response = await fetch(url);
  const data = (await response.json()) as SectorPeers[];
  return data;
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
  const response = await fetch(url);
  const data = (await response.json()) as PriceChange[];
  return data;
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
export const getNewsFromApi = async (newsType: NewsTypes, symbol: string = '') => {
  const resolveNewsUrl = (newsType: NewsTypes, symbol: string) => {
    const ticker = symbol ? `tickers=${symbol}&` : '';
    if (newsType === 'forex') {
      return `${FINANCIAL_MODELING_URL}/v4/forex_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
    }
    if (newsType === 'crypto') {
      return `${FINANCIAL_MODELING_URL}/v4/crypto_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
    }
    if (newsType === 'stocks') {
      return `${FINANCIAL_MODELING_URL}/v3/stock_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
    }
    // general
    return `${FINANCIAL_MODELING_URL}/v4/general_news?limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
  };

  const url = resolveNewsUrl(newsType, symbol);
  const response = await fetch(url);
  const data = await response.json();
  return data as News[];
};

/**
 *
 * @param type
 * @returns array of [{
    "symbol": "CYXT",
    "name": "Cyxtera Technologies, Inc.",
    "change": 0.0467,
    "price": 0.0885,
    "changesPercentage": 111.7225
  }]
 */
export const getMostPerformingStocks = async (type: 'gainers' | 'losers' | 'actives') => {
  const url = `${FINANCIAL_MODELING_URL}/v3/stock_market/${type}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as MostPerformingStocks[];
  return data.slice(0, 20);
};

export const getQuotesByType = async (type: AvailableQuotes) => {
  const url = `${FINANCIAL_MODELING_URL}/v3/quotes/${type}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as SymbolQuote[];
  return data;
};

export const getQuotesBySymbols = async (symbols: string[]) => {
  const symbolsString = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/quote/${symbolsString}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as SymbolQuote[];
  return data;
};

export const getCalendarStockDividends = async (
  month: number | string,
  year: number | string,
): Promise<CalendarDividend[]> => {
  const [from, to] = getDateRangeByMonthAndYear(month, year);
  const url = `${FINANCIAL_MODELING_URL}/v3/stock_dividend_calendar?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyStockDividend[];
  const filteredOutResponse = filterOutSymbols(
    data,
    [],
    ['recordDate', 'paymentDate', 'declarationDate', 'label', 'adjDividend'],
  );
  return filteredOutResponse;
};

export const getCalendarStockIPOs = async (
  month: number | string,
  year: number | string,
): Promise<CalendarStockIPO[]> => {
  const [from, to] = getDateRangeByMonthAndYear(month, year);
  const url = `${FINANCIAL_MODELING_URL}/v4/ipo-calendar-prospectus?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as (CalendarStockIPO & { ipoDate: string })[];
  const filteredOutResponse = filterOutSymbols(data);

  // change key name 'ipoDate' to 'date';
  filteredOutResponse.forEach((item) => {
    item.date = item.ipoDate;
  });

  return filteredOutResponse;
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
export const searchTicker = async (symbolPrefix: string | undefined, isCrypto = false): Promise<TickerSearch[]> => {
  if (!symbolPrefix) {
    return [];
  }

  const stockExchange = 'NASDAQ,NYSE,AMEX';
  const cryptoExchange = 'CRYPTO';
  const usedExchange = isCrypto ? cryptoExchange : stockExchange;
  const prefixUppercase = symbolPrefix.toUpperCase();
  const url = `${FINANCIAL_MODELING_URL}/v3/search-ticker?query=${prefixUppercase}&limit=12&exchange=${usedExchange}&apikey=${FINANCIAL_MODELING_KEY}`;

  const response = await fetch(url);
  const data = (await response.json()) as TickerSearch[];

  // check if symbol contains any of the ignored symbols
  const filteredResponse = filterOutSymbols(data);
  return filteredResponse;
};

export const getCalendarStockEarnings = async (
  month: number | string,
  year: number | string,
): Promise<CalendarStockEarning[]> => {
  const [from, to] = getDateRangeByMonthAndYear(month, year);
  const url = `${FINANCIAL_MODELING_URL}/v3/earning_calendar?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as StockEarning[];
  const filteredOutResponse = filterOutSymbols(data, [], ['fiscalDateEnding', 'updatedFromDate', 'time']);
  return filteredOutResponse;
};

export const getSymbolOwnershipInstitutional = async (symbol: string): Promise<SymbolOwnershipInstitutional[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/institutional-ownership/symbol-ownership?symbol=${symbol}&includeCurrentQuarter=true&&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as SymbolOwnershipInstitutional[];
  return data;
};

/**
 *
 * @param symbol
 * @param date - quarters in format YYYY-MM-DD: 2023-03-31, 2023-06-30, 2023-09-30, 2023-12-31
 * @returns
 */
export const getSymbolOwnershipHolders = async (
  symbol: string,
  date: string,
  page = 0,
): Promise<SymbolOwnershipHolders[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/institutional-ownership/institutional-holders/symbol-ownership-percent?symbol=${symbol}&page=${page}&date=${date}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as SymbolOwnershipHolders[];
  return data;
};

export const getInstitutionalPortfolioDates = async (cik: string = '0000093751'): Promise<string[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/institutional-ownership/portfolio-date?cik=${cik}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as { date: string }[];
  return data.map((d) => d.date);
};

export const getInsiderTrading = async (symbol: string, page = 0): Promise<CompanyInsideTrade[]> => {
  const url = `${FINANCIAL_MODELING_URL}/v4/insider-trading?symbol=${symbol}&page=${page}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as CompanyInsideTrade[];
  return data;
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

  const url = `${FINANCIAL_MODELING_URL}/v3/stock-screener?${searchParamsValues}limit=300&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as StockScreenerResults[];

  // check if symbol contains any of the ignored symbols
  const filteredResponse = filterOutSymbols(data, ['sector']);
  return filteredResponse;
};

export const getIsMarketOpen = async (
  exchange: 'NYSE' | 'NASDAQ' = 'NASDAQ',
): Promise<IsStockMarketOpenExtend | null> => {
  const url = `https://financialmodelingprep.com/api/v3/is-the-market-open?exchange=${exchange}&apikey=${FINANCIAL_MODELING_KEY}`;

  // function to check if value is number
  const isNumber = (value: string | number | unknown): boolean => {
    return value != null && value !== '' && typeof value === 'number' && !isNaN(Number(value.toString()));
  };

  try {
    const response = await fetch(url);
    const data = (await response.json()) as IsStockMarketOpen;

    const currentYear = new Date().getFullYear();

    // { "New Years Day": "2019-01-01", "Good Friday": "2019-04-19", ... }
    const currentHoliday =
      data.stockMarketHolidays.find((holiday) => String(holiday['year']) === String(currentYear)) ?? {};
    // get all holidays
    const allHolidays = data.stockMarketHolidays
      .map((holiday) => Object.values(holiday))
      .reduce((acc, val) => acc.concat(val), [])
      .filter((d) => !isNumber(d)); // filter out years

    // get only the dates
    const currentHolidayDates = Object.values(currentHoliday);

    const holidaysThisYear = {
      ...data,
      currentHoliday: currentHolidayDates,
      allHolidays: allHolidays,
    } satisfies IsStockMarketOpenExtend;

    return holidaysThisYear;
  } catch (e) {
    console.log('error in getTreasuryRates', e);
    return null;
  }
};

export const getTreasuryRates = async (limitDays = 7): Promise<TreasuryRates[]> => {
  const startDate = format(subDays(new Date(), limitDays), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const url = `https://financialmodelingprep.com/api/v4/treasury?from=${startDate}&to=${today}&apikey=${FINANCIAL_MODELING_KEY}`;
  try {
    const response = await fetch(url);
    const data = (await response.json()) as TreasuryRates[];
    return data;
  } catch (e) {
    console.log('error in getTreasuryRates', e);
    return [];
  }
};

/**
 *
 * @param type - type of economic data to query
 * @param section - if partial then query only the last 2 years or if all then query all data
 * @returns
 */
export const getEconomicDataByType = async (
  type: FinancialEconomicTypes,
  section: DataSelection = 'partial',
): Promise<DataDateValue[]> => {
  const fromDate = section === 'partial' ? format(startOfYear(subYears(new Date(), 5)), 'yyyy-MM-dd') : '1990-01-01';

  const url = `https://financialmodelingprep.com/api/v4/economic?from=${fromDate}&name=${type}&apikey=${FINANCIAL_MODELING_KEY}`;

  console.log('url', url);

  try {
    const response = await fetch(url);
    const data = (await response.json()) as { date: string; value: number }[];
    return data;
  } catch (e) {
    console.log('error in getTreasuryRates', e);
    return [];
  }
};
