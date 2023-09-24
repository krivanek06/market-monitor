import { getHistoricalPricesByPeriod } from '@market-monitor/api-external';
import { HistoricalLoadingPeriodsDates, HistoricalPrice, HistoricalPricePeriods, RESPONSE_HEADER } from '@market-monitor/api-types';
import { format, isWeekend, subDays } from 'date-fns';
import { Env } from './model';

/**
 * save all periods into KV except for currentDate
 * if currentDate is monday and period is '1d', load data from friday
 *
 *
 * @param env
 * @param symbol
 * @param period
 * @returns
 */
export const getPriceOnPeriod = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	const period = searchParams.get('period') as HistoricalPricePeriods | undefined;

	// check period
	if (!period) {
		return new Response('missing period', { status: 400 });
	}

	// create key
	const savedKey = `${symbol}-${period}`;

	// check data in cache
	const cachedData = (await env.historical_prices.get(savedKey, {
		type: 'json',
	})) as HistoricalPrice[] | null;

	// return data from cache if exists
	if (cachedData) {
		console.log(`Price on period key = ${savedKey} loaded from cache`);
		const reversedData = cachedData.reverse();
		return new Response(JSON.stringify(reversedData), RESPONSE_HEADER);
	}

	console.log(`Price on period key = ${savedKey} loaded from API`);

	// 12 hours
	const expiration12Hours = 12 * 60 * 60;

	// load data
	const historicalPrices = await loadHistoricalPrices(symbol, period);

	// save to cache if not 1d
	if (period !== '1d') {
		console.log(`Price on period key = ${savedKey} saved to cache`);
		env.historical_prices.put(savedKey, JSON.stringify(historicalPrices), { expirationTtl: expiration12Hours });
	}

	// return historicalPrices
	const result = historicalPrices.reverse();
	return new Response(JSON.stringify(result), RESPONSE_HEADER);
};

/**
 * load historical prices for current day. If period is '1d' and current day load fails then load data for previous day
 *
 * @param symbol
 * @param period
 */
const loadHistoricalPrices = async (symbol: string, period: HistoricalPricePeriods): Promise<HistoricalPrice[]> => {
	// try 10 attempts
	for (let i = 0; i < 10; i++) {
		const workingDay = subDays(new Date(), i);

		// skip weekends
		if (isWeekend(workingDay)) {
			continue;
		}

		// resolve loading period to dates
		const loadingPeriodSecond = resolveLoadingPeriod(period, workingDay);

		// load data
		const historicalPricesSecond = await getHistoricalPricesByPeriod(symbol, loadingPeriodSecond);

		// if data is loaded then return it
		if (historicalPricesSecond.length > 0) {
			return historicalPricesSecond;
		}
	}

	throw new Error(`Unable to load data for symbol=${symbol} and period=${period}`);
};

const resolveLoadingPeriod = (period: HistoricalPricePeriods, currentDate = new Date()): HistoricalLoadingPeriodsDates => {
	const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

	if (period === '1d') {
		return {
			userPeriod: period,
			loadingPeriod: '1min',
			from: formatDate(currentDate),
			to: formatDate(currentDate),
		};
	}

	if (period === '1w') {
		return {
			userPeriod: period,
			loadingPeriod: '5min',
			from: formatDate(subDays(currentDate, 7)),
			to: formatDate(currentDate),
		};
	}

	if (period === '1mo') {
		return {
			userPeriod: period,
			loadingPeriod: '1hour',
			from: formatDate(subDays(currentDate, 30)),
			to: formatDate(currentDate),
		};
	}

	if (period === '3mo') {
		return {
			userPeriod: period,
			loadingPeriod: '1hour',
			from: formatDate(subDays(currentDate, 90)),
			to: formatDate(currentDate),
		};
	}

	if (period === '6mo') {
		return {
			userPeriod: period,
			loadingPeriod: '4hour',
			from: formatDate(subDays(currentDate, 180)),
			to: formatDate(currentDate),
		};
	}

	if (period === '1y') {
		return {
			userPeriod: period,
			loadingPeriod: '1day',
			from: formatDate(subDays(currentDate, 365)),
			to: formatDate(currentDate),
		};
	}

	if (period === '5y') {
		return {
			userPeriod: period,
			loadingPeriod: '1week',
			from: formatDate(subDays(currentDate, 365 * 5)),
			to: formatDate(currentDate),
		};
	}

	if (period === 'all') {
		return {
			userPeriod: period,
			loadingPeriod: '1month',
			from: formatDate(subDays(currentDate, 365 * 20)),
			to: formatDate(currentDate),
		};
	}

	// ytd as default
	return {
		userPeriod: period,
		loadingPeriod: '1day',
		from: formatDate(new Date(currentDate.getFullYear(), 0, 1)),
		to: formatDate(currentDate),
	};
};
