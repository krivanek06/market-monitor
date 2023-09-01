import { getCalendarData } from './get-calendar-data';
import { getInstitutionalPortfolioDatesWrapper } from './get-institutional-portfolio';
import { getMarketOverData } from './get-market-overview';
import { getQuotesByTypeWrapper } from './get-quotes-by-type';
import { getTopSymbols } from './get-top-symbols';
import { Env } from './model';

type GetBasicDataType =
	| 'top-symbols'
	| 'quote-by-type'
	| 'institutional-portfolio-dates'
	| 'calendar'
	| 'market-overview'
	| 'market-overview-data';

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

		if (type === 'market-overview') {
		}

		if (type === 'market-overview-data') {
			return getMarketOverData(env, searchParams);
		}

		/**
		 * TODO: not working, upgrade to enterprise plan
		 */
		if (type === 'institutional-portfolio-dates') {
			return getInstitutionalPortfolioDatesWrapper(env, searchParams);
		}

		if (type === 'quote-by-type') {
			return getQuotesByTypeWrapper(env, searchParams);
		}

		return new Response('Unsupported request', { status: 400 });
	},
};
