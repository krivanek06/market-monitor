import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  MarketOverview,
  SymbolHistoricalPeriods,
  SymbolQuote,
  SymbolSummary,
} from '@mm/api-types';
import axios from 'axios';

export const getSymbolSummaries = async (symbols: string[]): Promise<SymbolSummary[]> => {
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

export const getSymbolQuotes = async (symbols: string[]): Promise<SymbolQuote[]> => {
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
    const data = (await response.json()) as SymbolSummary[];
    return data.map((d) => d.quote);
  } catch (error) {
    console.log(`Failed to get symbol summaries for ${symbols}`);
    console.log(error);
    return [];
  }
};

export const getPriceOnDateRange = async (
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

export const getHistoricalPricesCloudflare = async (
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

export const postMarketOverview = async (overview: MarketOverview): Promise<string> => {
  const url = `https://get-basic-data.krivanek1234.workers.dev?type=market-overview-save`;
  const response = await axios.post(
    url,
    {
      ...overview,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  const data = (await response.data) as string;
  return data;
};

export const getStockHistoricalPricesOnDate = (symbol: string, date: string): Promise<HistoricalPrice | null> => {
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
