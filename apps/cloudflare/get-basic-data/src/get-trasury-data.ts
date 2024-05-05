import { getTreasuryRates } from '@mm/api-external';
import { EXPIRATION_TWELVE_HOURS, RESPONSE_HEADER, TreasureDataBySections } from '@mm/api-types';
import { Env } from './model';

export const getTreasuryData = async (env: Env): Promise<Response> => {
	const cacheKey = 'treasury_rates';
	const cachedData = (await env.get_basic_data.get(cacheKey, {
		type: 'json',
	})) as TreasureDataBySections | undefined;

	// return cached data if exists
	if (cachedData) {
		console.log('Top symbols loaded from cache');
		return new Response(JSON.stringify(cachedData), RESPONSE_HEADER);
	}

	const data = await getTreasuryRates(120);

	const modifiedData = {
		date: data.map((d) => d.date).reverse(),
		month1: data.map((d) => d.month1).reverse(),
		month3: data.map((d) => d.month3).reverse(),
		month6: data.map((d) => d.month6).reverse(),
		year1: data.map((d) => d.year1).reverse(),
		year2: data.map((d) => d.year2).reverse(),
		year3: data.map((d) => d.year3).reverse(),
		year5: data.map((d) => d.year5).reverse(),
		year7: data.map((d) => d.year7).reverse(),
		year10: data.map((d) => d.year10).reverse(),
		year20: data.map((d) => d.year20).reverse(),
		year30: data.map((d) => d.year30).reverse(),
	} satisfies TreasureDataBySections;

	// save to cache
	await env.get_basic_data.put(cacheKey, JSON.stringify(modifiedData), { expirationTtl: EXPIRATION_TWELVE_HOURS });

	// return data
	return new Response(JSON.stringify(modifiedData), RESPONSE_HEADER);
};
