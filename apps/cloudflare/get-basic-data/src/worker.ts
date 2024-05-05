import { getCalendarData } from './get-calendar-data';
import { getEconomicData } from './get-economic-data';
import { getInstitutionalPortfolioDatesWrapper } from './get-institutional-portfolio';
import { getIsMarketOpenWrapper } from './get-is-market-open';
import { getNewsData } from './get-news-data';
import { getQuotesByTypeWrapper } from './get-quotes-by-type';
import { getTopSymbols } from './get-top-symbols';
import { getTreasuryData } from './get-trasury-data';
import { Env } from './model';

type GetBasicDataType =
	| 'top-symbols'
	| 'quote-by-type'
	| 'institutional-portfolio-dates'
	| 'calendar'
	| 'news'
	| 'market-is-open'
	| 'market-treasury'
	| 'market-economics';

/**
 * One endpoint for executing and caching basic HTTP requests
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type') as GetBasicDataType | undefined;

		// throw error if no type
		if (!type) {
			return new Response('missing type', { status: 400 });
		}

		if (type === 'top-symbols') {
			return getTopSymbols(env, searchParams);
		}

		if (type === 'calendar') {
			return getCalendarData(env, searchParams);
		}

		if (type === 'institutional-portfolio-dates') {
			return getInstitutionalPortfolioDatesWrapper(env, searchParams);
		}

		if (type === 'quote-by-type') {
			return getQuotesByTypeWrapper(env, searchParams);
		}

		if (type === 'market-is-open') {
			return getIsMarketOpenWrapper(env);
		}

		if (type === 'market-treasury') {
			return getTreasuryData(env);
		}

		if (type === 'market-economics') {
			return getEconomicData(env, searchParams);
		}

		if (type === 'news') {
			return getNewsData(env, searchParams);
		}

		return new Response('Unsupported request', { status: 400 });
	},
};
