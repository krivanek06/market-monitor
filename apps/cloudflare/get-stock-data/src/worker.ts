import { Env, GetStockData } from './model';
import { getStockDetailsWrapper } from './stock-details';
import { getStockEarningsWrapper } from './stock-earnings';
import { getStockHistoricalMetricWrapper } from './stock-historical-metrics';
import { getStockInsiderTradesWrapper } from './stock-insider-trades';
import { getStockOwnershipHoldersToDataWrapper } from './stock-ownership-holders-to-date';
import { getStockOwnershipInstitutionalWrapper } from './stock-ownership-institutional';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);

		const type = searchParams.get('type') as GetStockData | undefined;
		const symbol = searchParams.get('symbol') as string | undefined;

		// throw error if no type
		if (!type) {
			return new Response('missing type', { status: 400 });
		}

		// throw error if no symbol
		if (!symbol) {
			return new Response('missing symbol', { status: 400 });
		}

		if (type === 'stock-earnings') {
			return getStockEarningsWrapper(env, symbol, searchParams);
		}

		if (type === 'stock-historical-metrics') {
			return getStockHistoricalMetricWrapper(env, symbol, searchParams);
		}

		if (type === 'stock-insider-trades') {
			return getStockInsiderTradesWrapper(env, symbol, searchParams);
		}

		if (type === 'stock-ownership-holders-to-date') {
			return getStockOwnershipHoldersToDataWrapper(env, symbol, searchParams);
		}

		if (type === 'stock-ownership-institutional') {
			return getStockOwnershipInstitutionalWrapper(env, symbol, searchParams);
		}

		if (type === 'stock-details') {
			return getStockDetailsWrapper(env, symbol, searchParams);
		}

		return new Response('unsupported type', { status: 400 });
	},
};
