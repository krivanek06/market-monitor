import { getHistoricalPricesOnDateRange } from '@mm/api-external';
import { RESPONSE_HEADER } from '@mm/api-types';
import { format, isBefore, isSameDay, isValid } from 'date-fns';

export const getPriceOnDateRange = async (symbolStrings: string, searchParams: URLSearchParams): Promise<Response> => {
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

	// format dates to YYYY-MM-DD
	const startDate = format(new Date(dateStartParam), 'yyyy-MM-dd');
	const endDate = format(new Date(dateEndParam), 'yyyy-MM-dd');

	// load data from API
	const data = await getHistoricalPricesOnDateRange(symbolStrings, startDate, endDate);
	const reversedData = data.reverse();

	// return data
	return new Response(JSON.stringify(reversedData), RESPONSE_HEADER);
};
