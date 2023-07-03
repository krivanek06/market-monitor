import { AvailableQuotes, MostPerformingStocks, News, SymbolQuote } from '@market-monitor/api-types';
import axios from 'axios';
import { FINANCIAL_MODELING_KEY, FINANCIAL_MODELING_URL } from './environments';

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
