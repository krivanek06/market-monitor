import { getHistoricalPricesOnDateRange } from '@mm/api-external';
import { EXPIRATION_EIGHT_HOURS, HistoricalPrice } from '@mm/api-types';
import { format, isBefore } from 'date-fns';
import { Env } from './model';

export const getHistoricalPriceHelper = async (
	env: Env,
	symbol: string,
	startDate: string,
	endDate: string,
): Promise<HistoricalPrice[]> => {
	// format dates to YYYY-MM-DD
	const startDateFormat = '2022-01-01'; // use hardcoded date for now
	const endDateFormat = format(new Date(), 'yyyy-MM-dd'); // use today's date
	const cacheKey = `${symbol}-historical`;

	// check if dates are valid
	if (isBefore(endDate, startDate)) {
		throw new Error('end data is before start date');
	}

	// check if startDate before startDateFormat
	if (isBefore(startDate, startDateFormat)) {
		throw new Error('Can not load data before 2022-01-01');
	}

	// check data in cache
	const cachedData = (await env.historical_prices.get(cacheKey, {
		type: 'json',
	})) as HistoricalPrice[] | null;

	// return sliced data from cache if exists
	if (cachedData) {
		console.log(`Symbol ${symbol} loaded from cache, start: ${startDate}, end: ${endDate}`);
		const slicedData = cachedData.filter((price) => price.date >= startDate && price.date <= endDate);

		// return data if exists
		if (cachedData.length > 0) {
			return slicedData;
		}
	}

	console.log('load data from API', symbol);

	// load data from API
	const data = await getHistoricalPricesOnDateRange(symbol, startDateFormat, endDateFormat);

	// order data in ASC order
	const reversedData = data.reverse();

	// save data
	env.historical_prices.put(cacheKey, JSON.stringify(reversedData), { expirationTtl: EXPIRATION_EIGHT_HOURS });

	// return sliced data
	const slicedData = reversedData.filter((price) => price.date >= startDate && price.date <= endDate);
	return slicedData;
};
