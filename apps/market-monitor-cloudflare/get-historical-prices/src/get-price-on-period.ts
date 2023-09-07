import { getHistoricalPricesByPeriod } from '@market-monitor/api-external';
import { HistoricalLoadingPeriodsDates, HistoricalPrice, HistoricalPricePeriods, RESPONSE_HEADER } from '@market-monitor/api-types';
import { dateGetDateOfOpenStockMarket } from '@market-monitor/shared-utils-general';
import { format, subDays } from 'date-fns';
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
export const getPriceOnPeriod = async (env: Env, symbol: string, period: HistoricalPricePeriods): Promise<Response> => {
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
 * when loading data for 1d and stock market is not yet open - we load data from previous day
 *
 * @param symbol
 * @param period
 */
const loadHistoricalPrices = async (symbol: string, period: HistoricalPricePeriods): Promise<HistoricalPrice[]> => {
	// resolve loading period to dates
	const loadingPeriod = resolveLoadingPeriod(period);

	// load data
	const historicalPrices = await getHistoricalPricesByPeriod(symbol, loadingPeriod);

	// return data if exists
	if (historicalPrices.length !== 0) {
		return historicalPrices;
	}

	// the following happen when period === 1d and stock market is not yet open

	// from previous day check when is the last time market is open - not holiday, etc.
	const correctDate = dateGetDateOfOpenStockMarket(subDays(new Date(), 1));

	// resolve loading period to dates
	const loadingPeriodSecond = resolveLoadingPeriod(period, correctDate);

	// load data
	const historicalPricesSecond = await getHistoricalPricesByPeriod(symbol, loadingPeriodSecond);

	return historicalPricesSecond;
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
