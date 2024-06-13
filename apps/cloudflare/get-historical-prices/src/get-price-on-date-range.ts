import { RESPONSE_HEADER } from '@mm/api-types';
import { isBefore, isSameDay, isValid } from 'date-fns';
import { getHistoricalPriceHelper } from './historical-price-helper';
import { Env } from './model';

export const getPriceOnDateRange = async (env: Env, symbolStrings: string, searchParams: URLSearchParams): Promise<Response> => {
	const dateStartParam = searchParams.get('dateStart') as string | undefined;
	const dateEndParam = searchParams.get('dateEnd') as string | undefined;

	// check if dateStart and dateEnd exists
	if (!dateStartParam || !dateEndParam) {
		return new Response('missing dateStart or dateEnd', { status: 400 });
	}

	// check if dates are valid
	if (!isValid(new Date(dateStartParam)) || !isValid(new Date(dateEndParam))) {
		return new Response('invalid dateStart or dateEnd', { status: 400 });
	}

	// check if startDate before endDate
	if (isBefore(new Date(dateEndParam), new Date(dateStartParam)) && !isSameDay(new Date(dateEndParam), new Date(dateStartParam))) {
		return new Response('dateEnd is before startDate', { status: 400 });
	}

	try {
		const loadedData = await getHistoricalPriceHelper(env, symbolStrings, dateStartParam, dateEndParam);

		// return data
		return new Response(JSON.stringify(loadedData), RESPONSE_HEADER);
	} catch (error: any) {
		return new Response(error.message, { status: 400 });
	}
};
