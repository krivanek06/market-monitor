import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  IsStockMarketOpenExtend,
  SymbolHistoricalPeriods,
  SymbolQuote,
  SymbolSummary,
} from '@mm/api-types';
import axios from 'axios';

export const getSymbolSummariesCF = async (symbols: string[]): Promise<SymbolSummary[]> => {
  const url = `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`Not ok ${response.statusText}, URL: ${response.url}`);
      return [];
    }
    const data = (await response.json()) as SymbolSummary[];
    return data;
  } catch (error) {
    console.log(`Failed to get symbol summaries for ${symbols}`);
    console.log(error);
    return [];
  }
};

/**
 *
 * @param symbols
 * @param isAfterHours - will cache the symbol on the BE until the next trading day
 * @returns
 */
export const getSymbolQuotesCF = async (symbols: string[]): Promise<SymbolQuote[]> => {
  const url = `https://get-symbol-summary.krivanek1234.workers.dev/?symbol=${symbols.join(',')}&onlyQuote=true`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`Not ok ${response.statusText}, URL: ${response.url}`);
      return [];
    }
    const data = (await response.json()) as SymbolQuote[];
    return data;
  } catch (error) {
    console.log(`Failed to get symbol summaries for ${symbols}`);
    console.log(error);
    return [];
  }
};

export const getHistoricalPricesOnDateCF = async (
  symbol: string,
  dateStart: string,
  endDate: string,
): Promise<HistoricalPriceSymbol | null> => {
  const url = `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&dateStart=${dateStart}&dateEnd=${endDate}&type=dateRange`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`Not ok ${response.statusText}, URL: ${response.url}`);
      return null;
    }
    const data = (await response.json()) as HistoricalPrice[];
    return { symbol, data };
  } catch (error) {
    console.log(`Failed to get historical prices for ${symbol} with date range ${dateStart} - ${endDate}`);
    console.log(error);
    return null;
  }
};

export const getIsMarketOpenCF = async (): Promise<IsStockMarketOpenExtend | undefined> => {
  const url = `https://get-basic-data.krivanek1234.workers.dev/?type=market-is-open`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`Not ok ${response.statusText}, URL: ${response.url}`);
      return undefined;
    }
    const data = (await response.json()) as IsStockMarketOpenExtend;
    return data;
  } catch (error) {
    console.log(`Failed to get is market open`);
    console.log(error);
    return undefined;
  }
};

export const getHistoricalPricesCF = async (
  symbol: string,
  period: SymbolHistoricalPeriods,
): Promise<HistoricalPrice[]> => {
  const url = `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&period=${period}&type=period`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`Not ok ${response.statusText}, URL: ${response.url}`);
      return [];
    }

    const data = (await response.json()) as HistoricalPrice[];
    return data;
  } catch (error) {
    console.log(`Failed to get historical prices for ${symbol} with period ${period}`);
    console.log(error);
    return [];
  }
};

export const getStockHistoricalPricesOnDateCF = (symbol: string, date: string): Promise<HistoricalPrice | null> => {
  return axios
    .get<HistoricalPrice | null>(
      `https://get-historical-prices.krivanek1234.workers.dev?symbol=${symbol}&date=${date}&type=specificDate`,
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};
