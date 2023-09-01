import { getCalendarStockDividends, getCalendarStockEarnings, getCalendarStockIPOs } from '@market-monitor/api-external';
import { AllowedCalendarAssetTypes, CalendarAssetDataTypes, CalendarAssetTypes, RESPONSE_HEADER } from '@market-monitor/api-types';
import { Env } from './model';

export const getCalendarData = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	const year = searchParams.get('year') as string | undefined;
	const month = searchParams.get('month') as string | undefined;
	const calendarType = searchParams.get('calendarType') as CalendarAssetTypes | undefined;

	// missing data
	if (!year || !month || !calendarType) {
		return new Response('missing calendarType, year or month', { status: 400 });
	}

	// not allowed type
	if (!AllowedCalendarAssetTypes.includes(calendarType)) {
		return new Response('not allowed calendarType', { status: 400 });
	}

	// create KV key
	const key = `${calendarType}-${year}-${month}`;

	// check data in KV
	const cachedData = await env.get_basic_data.get(key);
	if (cachedData) {
		return new Response(cachedData, RESPONSE_HEADER);
	}

	// get data from API
	const data = await resultAPIbyType(calendarType, year, month);

	// save data into KV
	const expirationOneWeek = 60 * 60 * 24 * 7;
	await env.get_basic_data.put(key, JSON.stringify(data), { expirationTtl: expirationOneWeek });

	// return data
	return new Response(JSON.stringify(data), RESPONSE_HEADER);
};

const resultAPIbyType = <T extends CalendarAssetDataTypes>(type: CalendarAssetTypes, year: string, month: string): Promise<T[]> => {
	switch (type) {
		case 'dividends':
			return getCalendarStockDividends(month, year) as Promise<T[]>;
		case 'earnings':
			return getCalendarStockEarnings(month, year) as Promise<T[]>;
		case 'ipo':
			return getCalendarStockIPOs(month, year) as Promise<T[]>;
	}
};
