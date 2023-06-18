import { MostPerformingStocks } from '@market-monitor/api-types';
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
