import { getPriceOnDate } from './get-price-on-date';
import { getPriceOnDateRange } from './get-price-on-date-range';
import { getPriceOnPeriod } from './get-price-on-period';
import { Env } from './model';

/**
 * return either historical data in array for a symbol if `period` is provided
 * of historical data in object for a symbol for a specific date if `date` is provided
 */
export type HistoricalPriceType = 'period' | 'specificDate' | 'dateRange';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);

		const symbol = searchParams.get('symbol') as string | undefined;
		const type = searchParams.get('type') as HistoricalPriceType | undefined;

		const isCrypto = searchParams.get('isCrypto') as string | undefined;
		const isCryptoBool = isCrypto === 'true';

		if (!symbol) {
			return new Response('missing symbol', { status: 400 });
		}

		if (!type) {
			return new Response('missing type', { status: 400 });
		}

		if (type === 'specificDate') {
			return getPriceOnDate(env, symbol, searchParams);
		}

		if (type === 'period') {
			return getPriceOnPeriod(env, symbol, searchParams);
		}

		if (type === 'dateRange') {
			return getPriceOnDateRange(symbol, searchParams);
		}

		// invalid request
		return new Response('invalid request', { status: 400 });
	},
};
