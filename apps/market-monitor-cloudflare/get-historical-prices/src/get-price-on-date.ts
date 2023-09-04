import { getHistoricalPricesOnDate } from '@market-monitor/api-external';
import { HistoricalPriceSymbol, RESPONSE_HEADER } from '@market-monitor/api-types';
import { isToday } from 'date-fns';
import { Env } from './model';

/**
 *
 * @param env
 * @param symbolStrings format is symbol1,symbol2,symbol3
 * @param date format YYYY-MM-DD
 * @returns
 */
export const getPriceOnDate = async (env: Env, symbolStrings: string, date: string): Promise<Response> => {
	const createDBKey = (symbol: string, date: string): string => `${symbol}_${date}`;

	// get symbols and filter out empty
	const symbols = symbolStrings.split(',').filter((s) => s.length > 0);

	if (symbols.length === 0) {
		return new Response('missing symbols', { status: 400 });
	}

	// create keys
	const symbolKeys = symbols.map((d) => createDBKey(d, date));

	// 3 minutes if today, 8 hours otherwise
	const expiration = isToday(new Date(date)) ? 3 : 8 * 60 * 60;

	// load saved data from cache
	const storedData = (
		await Promise.all(
			symbolKeys.map(
				(key) =>
					env.historical_prices.get(key, {
						type: 'json',
					}) as Promise<HistoricalPriceSymbol | null>,
			),
		)
	).filter((d): d is HistoricalPriceSymbol => !!d);

	// filter out non existing data
	const nonExistingData = symbols.filter((s) => !storedData.find((d) => d.symbol === s));

	// load prices from api
	const apiCallsNonExisting = nonExistingData.map((nonExisting) => getHistoricalPricesOnDate(nonExisting, date));

	// wait for all api calls to finish and filter out null data
	const apiData = (await Promise.all(apiCallsNonExisting)).filter((d): d is HistoricalPriceSymbol => !!d);

	// save data into cache if not today
	apiData.forEach((d) => {
		if (!isToday(new Date(date))) {
			env.historical_prices.put(createDBKey(d.symbol, date), JSON.stringify(d), { expirationTtl: expiration });
		}
	});

	// return data
	return new Response(JSON.stringify([...storedData, ...apiData]), RESPONSE_HEADER);
};
