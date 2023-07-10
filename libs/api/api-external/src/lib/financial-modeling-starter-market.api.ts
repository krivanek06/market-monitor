import {
  AvailableQuotes,
  CalendarStockDividend,
  CalendarStockEarning,
  CalendarStockIPO,
  MostPerformingStocks,
  News,
  SymbolQuote,
} from '@market-monitor/api-types';
import axios from 'axios';
import { FINANCIAL_MODELING_KEY, FINANCIAL_MODELING_URL } from './environments';
import { filterOutSymbols, getDateRangeByMonthAndYear } from './helpers';

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
  const response = await axios.get<MostPerformingStocks[]>(url);
  return response.data.slice(0, 20);
};

export const getNewsForex = async (symbol: string = '') => {
  const ticker = symbol ? `tickers=${symbol}&` : '';
  const url = `${FINANCIAL_MODELING_URL}/v4/forex_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<News[]>(url);
  return response.data;
};

export const getNewsStock = async (symbol: string = '') => {
  const ticker = symbol ? `tickers=${symbol}&` : '';
  const url = `${FINANCIAL_MODELING_URL}/v3/stock_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<News[]>(url);
  return response.data;
};

export const getNewsCrypto = async (symbol: string = '') => {
  const ticker = symbol ? `tickers=${symbol}&` : '';
  const url = `${FINANCIAL_MODELING_URL}/v4/crypto_news?${ticker}limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<News[]>(url);
  return response.data;
};

export const getNewsGeneral = async () => {
  const url = `${FINANCIAL_MODELING_URL}/v4/general_news?limit=75&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<News[]>(url);
  return response.data;
};

export const getQuotesByType = async (type: AvailableQuotes) => {
  const url = `${FINANCIAL_MODELING_URL}/v3/quotes/${type}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<SymbolQuote[]>(url);
  return response.data;
};

export const getQuotesBySymbols = async (symbols: string[]) => {
  const symbolsString = symbols.join(',');
  const url = `${FINANCIAL_MODELING_URL}/v3/quote/${symbolsString}?apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<SymbolQuote[]>(url);
  return response.data;
};

export const getCalendarStockDividends = async (month: number | string, year: number | string) => {
  const [from, to] = getDateRangeByMonthAndYear(month, year);
  const url = `${FINANCIAL_MODELING_URL}/v3/stock_dividend_calendar?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<CalendarStockDividend[]>(url);
  const filteredOutResponse = filterOutSymbols(response.data);
  return filteredOutResponse;
};

export const getCalendarStockIPOs = async (month: number | string, year: number | string) => {
  const [from, to] = getDateRangeByMonthAndYear(month, year);
  const url = `${FINANCIAL_MODELING_URL}/v4/ipo-calendar-prospectus?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<CalendarStockIPO[]>(url);
  const filteredOutResponse = filterOutSymbols(response.data);
  return filteredOutResponse;
};

export const getCalendarStockEarnings = async (month: number | string, year: number | string) => {
  const [from, to] = getDateRangeByMonthAndYear(month, year);
  console.log(from, to);
  const url = `${FINANCIAL_MODELING_URL}/v3/earning_calendar?from=${from}&to=${to}&apikey=${FINANCIAL_MODELING_KEY}`;
  const response = await axios.get<CalendarStockEarning[]>(url);
  const filteredOutResponse = filterOutSymbols(response.data, ['epsEstimated']);
  return filteredOutResponse;
};
