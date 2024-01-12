import { getHistoricalPricesOnDateRange } from '@market-monitor/api-external';
import { HistoricalPrice, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

/**
 *
 * @param env
 * @param symbolStrings format is symbol1
 * @param date format YYYY-MM-DD
 * @returns
 */
export const getPriceOnDate = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	const date = searchParams.get('date') as string | undefined;

	// check date
	if (!date) {
		return new Response('missing date', { status: 400 });
	}

	// load prices from api
	const data = await getHistoricalPricesOnDate(symbol, date);

	// return data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};

const getHistoricalPricesOnDate = async (symbol: string, date: string): Promise<HistoricalPrice | null> => {
	const data = await getHistoricalPricesOnDateRange(symbol, date, date);
	return data[0] ?? null;
};
