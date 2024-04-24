import { getHistoricalPricesOnDateRange } from '@mm/api-external';
import { HistoricalPrice, RESPONSE_HEADER } from '@mm/api-types';
import { format, subDays } from 'date-fns';
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

	let data: HistoricalPrice | null = null;

	// check if date is valid - not holiday, weekend, etc.
	for (let i = 0; i < 5; i++) {
		const usedDate = format(subDays(date, i), 'yyyy-MM-dd');
		data = await getHistoricalPricesOnDate(symbol, usedDate);
		// stop polling if data is found
		if (data) {
			break;
		}
	}

	// return data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};

const getHistoricalPricesOnDate = async (symbol: string, date: string): Promise<HistoricalPrice | null> => {
	const data = await getHistoricalPricesOnDateRange(symbol, date, date);
	return data[0] ?? null;
};
