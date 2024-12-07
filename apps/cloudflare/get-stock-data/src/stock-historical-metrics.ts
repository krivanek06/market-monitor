import { getCompanyKeyMetrics, getCompanyRatios } from '@mm/api-external';
import {
	DataTimePeriod,
	DataTimePeriodEnum,
	EXPIRATION_ONE_WEEK,
	RESPONSE_HEADER,
	StockMetricsHistoricalAPI,
	StockMetricsHistoricalBasic,
} from '@mm/api-types';
import { dateFormatDate, getCurrentDateIOSFormat } from '@mm/shared/general-util';
import { Env } from './model';

export const getStockHistoricalMetricWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	const timePeriod = (searchParams.get('timePeriod') as DataTimePeriodEnum) ?? DataTimePeriodEnum.QUARTER;

	// user may send invalid time period
	if (timePeriod !== DataTimePeriodEnum.QUARTER && timePeriod !== DataTimePeriodEnum.YEAR) {
		return new Response('invalid time period', { status: 400 });
	}

	// create cache key
	const key = `${symbol}_historical_metrics_${timePeriod}`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData) {
		console.log(`Stock historical metrics for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock historical metrics for ${symbol} loaded from API`);

	// load data
	try {
		const data = await getStockHistoricalMetrics(symbol);

		// format data
		const formattedData = formatData(data, timePeriod);

		// save to cache
		env.get_stock_data.put(key, JSON.stringify(formattedData), { expirationTtl: EXPIRATION_ONE_WEEK });

		// stringify data and return
		return new Response(JSON.stringify(formattedData), RESPONSE_HEADER);
	} catch (e) {
		console.log(e);
		return new Response(`Unable to Provide data for symbol=${symbol}`, { status: 400 });
	}
};

const getStockHistoricalMetrics = async (symbol: string): Promise<StockMetricsHistoricalAPI> => {
	// get data from API
	const [keyMetricsQuarter, keyMetricsYear, ratiosQuarter, ratiosYear] = await Promise.all([
		getCompanyKeyMetrics(symbol, 'quarter'),
		getCompanyKeyMetrics(symbol, 'year'),
		getCompanyRatios(symbol, 'quarter'),
		getCompanyRatios(symbol, 'year'),
	]);

	// construct result
	const result: StockMetricsHistoricalAPI = {
		quarter: {
			keyMetrics: keyMetricsQuarter,
			ratios: ratiosQuarter,
		},
		year: {
			keyMetrics: keyMetricsYear,
			ratios: ratiosYear,
		},
		lastUpdate: getCurrentDateIOSFormat(),
	};

	// return data
	return result;
};

const formatData = (data: StockMetricsHistoricalAPI, timePeriod: DataTimePeriod): StockMetricsHistoricalBasic => {
	const keyMetrics = data[timePeriod].keyMetrics.reverse();
	const ratios = data[timePeriod].ratios.reverse();

	return {
		dates: keyMetrics.map((d) => dateFormatDate(d.date, 'MMMM d, y')),
		marketCap: keyMetrics.map((d) => d.marketCap),
		enterpriseValue: keyMetrics.map((d) => d.enterpriseValue),
		ratios: {
			peRatio: keyMetrics.map((d) => d.peRatio),
			currentRatio: keyMetrics.map((d) => d.currentRatio),
			quickRatio: ratios.map((d) => d.quickRatio),
			cashRatio: ratios.map((d) => d.cashRatio),
			priceToSalesRatio: keyMetrics.map((d) => d.priceToSalesRatio),
			pocfratio: keyMetrics.map((d) => d.pocfratio),
			pfcfRatio: keyMetrics.map((d) => d.pfcfRatio),
			pbRatio: keyMetrics.map((d) => d.pbRatio),
			debtRatio: ratios.map((d) => d.debtRatio),
			debtToEquity: keyMetrics.map((d) => d.debtToEquity),
			debtToAssets: keyMetrics.map((d) => d.debtToAssets),
			dividendYield: keyMetrics.map((d) => d.dividendYield),
			stockBasedCompensationToRevenue: keyMetrics.map((d) => d.stockBasedCompensationToRevenue),
		},
		margin: {
			netProfitMargin: ratios.map((d) => d.netProfitMargin),
			grossProfitMargin: ratios.map((d) => d.grossProfitMargin),
		},
		dividends: {
			dividendPayoutRatio: ratios.map((d) => d.dividendPayoutRatio),
			dividendYield: keyMetrics.map((d) => d.dividendYield),
		},
		perShare: {
			revenuePerShare: keyMetrics.map((d) => d.revenuePerShare),
			netIncomePerShare: keyMetrics.map((d) => d.netIncomePerShare),
			cashPerShare: keyMetrics.map((d) => d.cashPerShare),
			bookValuePerShare: keyMetrics.map((d) => d.bookValuePerShare),
			freeCashFlowPerShare: keyMetrics.map((d) => d.freeCashFlowPerShare),
		},
	};
};
