import { getEconomicDataByType } from '@mm/api-external';
import {
	DataDateValueArray,
	EXPIRATION_ONE_DAY,
	FinancialEconomicTypes,
	RESPONSE_HEADER,
	financialEconomicTypesConst,
} from '@mm/api-types';
import { getObjectEntries } from '@mm/shared/general-util';
import { Env } from './model';

export const getEconomicData = async (env: Env, searchParams: URLSearchParams): Promise<Response> => {
	const economicType = searchParams.get('economicType') as FinancialEconomicTypes | undefined;

	// loaded only one specific type
	if (economicType) {
		const data = await getEconomicDataExactType(env, economicType);
		return new Response(JSON.stringify(data), RESPONSE_HEADER);
	}

	// loading partial data from all types
	const promises = financialEconomicTypesConst.map((type) => getEconomicDataExactType(env, type));
	const allData = await Promise.all(promises);
	const allDataReduced = allData.reduce((acc, curr) => ({ ...acc, ...curr }));

	// return only first 50 values for each type
	const allDataPartial = getObjectEntries(allDataReduced).reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: {
				date: value.date.slice(50),
				value: value.value.slice(50),
			} satisfies DataDateValueArray,
		}),
		{} as { [K in FinancialEconomicTypes]: DataDateValueArray },
	);

	return new Response(JSON.stringify(allDataPartial), RESPONSE_HEADER);
};

const getEconomicDataExactType = async <T extends FinancialEconomicTypes>(
	env: Env,
	economicType: T,
): Promise<{ [K in T]: DataDateValueArray }> => {
	const cacheKey = `economic_${economicType}`;
	const cachedData = (await env.get_basic_data.get(cacheKey, {
		type: 'json',
	})) as DataDateValueArray;

	// return cached data if exists
	if (cachedData) {
		return { [economicType]: cachedData } as { [K in T]: DataDateValueArray };
	}

	// get data from API
	const data = await getEconomicDataByType(economicType, 'all');
	const dataTransformed = {
		date: data.map((d) => d.date).reverse(),
		value: data.map((d) => d.value).reverse(),
	} satisfies DataDateValueArray;

	// save into cache
	await env.get_basic_data.put(cacheKey, JSON.stringify(dataTransformed), { expirationTtl: EXPIRATION_ONE_DAY });

	// return data
	return { [economicType]: dataTransformed } as { [K in T]: DataDateValueArray };
};
