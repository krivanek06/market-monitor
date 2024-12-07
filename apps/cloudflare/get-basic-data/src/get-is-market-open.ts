import { getIsMarketOpen } from '@mm/api-external';
import { EXPIRATION_TEN_MINUTES, IsStockMarketOpenExtend, RESPONSE_HEADER } from '@mm/api-types';
import { getCurrentDateIOSFormat, tryJSONParse } from '@mm/shared/general-util';
import { isAfter } from 'date-fns';
import { Env } from './model';

type SavedData = {
	data: IsStockMarketOpenExtend;
	date: string;
	version: number;
};

export const getIsMarketOpenWrapper = async (env: Env): Promise<Response> => {
	// if version differs, invalidate cache
	const currentVersion = 1;

	// load data from KV
	const cacheKey = 'is_market_open';
	const cachedDataString = await env.get_basic_data.get(cacheKey);
	const cachedData = tryJSONParse<SavedData>(cachedDataString);

	// check data validity
	if (cachedData?.version && cachedData.data && cachedData.version === currentVersion) {
		// format: DD/MM/YYYY HH:MM:SS
		const marketOpenTime = marketOpenTimeEST();
		const savedTimeEST = new Date(new Date(cachedData.date).toLocaleString('en', { timeZone: 'EST' }));
		const currentTimeEST = new Date(new Date().toLocaleString('en', { timeZone: 'EST' }));

		// market is already open & saved time is before market open
		const shouldRefresh = isAfter(currentTimeEST, marketOpenTime) && isAfter(marketOpenTime, savedTimeEST);

		if (!shouldRefresh) {
			return new Response(JSON.stringify(cachedData.data), RESPONSE_HEADER);
		}
	}

	// load from api
	const data = await getIsMarketOpen('NASDAQ');
	const saveData = {
		data: data!,
		date: getCurrentDateIOSFormat(),
		version: currentVersion,
	} satisfies SavedData;

	// save into cache
	env.get_basic_data.put(cacheKey, JSON.stringify(saveData), { expirationTtl: EXPIRATION_TEN_MINUTES });

	// return stringified data
	return new Response(JSON.stringify(saveData.data), RESPONSE_HEADER);
};

const marketOpenTimeEST = (): Date => {
	const current = new Date(new Date().toLocaleString('en', { timeZone: 'EST' }));
	current.setHours(9);
	current.setMinutes(30);
	current.setSeconds(0);

	// return 9:30
	return current;
};
