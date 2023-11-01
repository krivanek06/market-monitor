import { MARKET_OVERVIEW_ENDPOINTS } from '@market-monitor/api-types';
import axios from 'axios';
import { QUANDL_KEY, QUANDL_URL } from './environments';

type QuandlResponseDataTypes = [string, number][] | [string, ...number[]][];

type QuandlResponseData<T extends QuandlResponseDataTypes> = {
  data: T;
  dates: string[];
  frequency: string;
  start_date: string;
  end_date: string;
  lastUpdate: string;
  name: string;
  column_names: string[];
};

const getQuandlDataGeneric = async <T extends QuandlResponseDataTypes>(key: string): Promise<QuandlResponseData<T>> => {
  try {
    // url return a HTML string
    const response = await axios.get<string | QuandlResponseData<T>>(`${QUANDL_URL}/${key}?api_key=${QUANDL_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // parse out the json string from HTML
    if (typeof response.data === 'string') {
      const regex = /"dataset"\s*:\s*({[^}]+})/;
      const match = response.data.match(regex);
      if (match) {
        const datasetObject = JSON.parse(match[1]);
        return datasetObject;
      }
      throw new Error('no match found');
    }

    return response.data;
  } catch (e) {
    console.log('error in getQuandlDataGeneric', e);
    throw e;
  }
};

export const getQuandlDataFormatter = async (key: string): Promise<[string, number][]> => {
  return (await getQuandlDataGeneric<[string, number][]>(key)).data;
};

// ------------------- Treasury yield -------------------

/**
 * columns:
 *  -- "Date",  "1 MO",  "2 MO",  "3 MO",  "6 MO",  "1 YR",  "2 YR",  "3 YR",  "5 YR",  "7 YR",  "10 YR",  "20 YR",  "30 YR"
 */
export const getTreasuryYieldUS = async (): Promise<[string, ...number[]][]> => {
  const quandlData = await getQuandlDataGeneric<[string, ...number[]][]>(
    MARKET_OVERVIEW_ENDPOINTS.treasury.data[0].key,
  );

  // format data for each column, remove first column (date)
  // const result = quandlData.column_names.map((_, index) => quandlData.data.map((data) => data[index])).slice(1);

  return quandlData.data;
};
