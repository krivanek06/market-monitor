import { HistoricalPricePeriods, HistoricalPricePeriodsArray } from '@market-monitor/api-external';
import { getPriceOnDate } from './get-price-on-date';
import { getPriceOnPeriod } from './get-price-on-period';
import { Env } from './model';

/**
 * return either historical data in array for a symbol if `period` is provided
 * of historical data in object for a symbol for a specific date if `date` is provided
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);

		const symbol = searchParams.get('symbol') as string | undefined;
		const period = searchParams.get('period') as HistoricalPricePeriods | undefined;
		const date = searchParams.get('date') as string | undefined;
		const isCrypto = searchParams.get('isCrypto') as string | undefined;

		const isCryptoBool = isCrypto === 'true';

		if (!symbol) {
			return new Response('missing symbol', { status: 400 });
		}

		if (!period && !date) {
			return new Response('missing period or date', { status: 400 });
		}

		if (period && !HistoricalPricePeriodsArray.includes(period)) {
			return new Response(`Valid periods are: ${HistoricalPricePeriodsArray}`, { status: 400 });
		}

		if (date) {
			try {
				return getPriceOnDate(env, symbol, date);
			} catch (e) {
				console.log(`Unable to Provide data for symbol=${symbol} and date=${date}`);
				return new Response(`Unable to Provide data for symbol=${symbol} and date=${date}`, { status: 400 });
			}
		}

		if (period) {
			try {
				return getPriceOnPeriod(env, symbol, period);
			} catch (e) {
				console.log(`Unable to Provide data for symbol=${symbol} and period=${period}`);
				return new Response(`Unable to Provide data for symbol=${symbol} and period=${period}`, { status: 400 });
			}
		}

		// invalid request
		return new Response('invalid request', { status: 400 });
	},
};
