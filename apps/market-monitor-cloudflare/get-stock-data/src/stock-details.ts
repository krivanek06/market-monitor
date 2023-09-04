import {
	getCompanyKeyMetricsTTM,
	getCompanyOutlook,
	getEnterpriseValue,
	getEsgDataQuarterly,
	getEsgRatingYearly,
	getPriceTarget,
	getRecommendationTrends,
	getSectorPeersForSymbols,
	getStockHistoricalEarnings,
	getUpgradesDowngrades,
} from '@market-monitor/api-external';
import { EXPIRATION_ONE_WEEK, RESPONSE_HEADER, StockDetailsAPI } from '@market-monitor/api-types';
import { Env } from './model';

export const getStockDetailsWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	const reloadParam = searchParams.get('reload') === 'true' ? true : false;

	// crate cache key
	const key = `${symbol}_details`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData && !reloadParam) {
		console.log(`Stock details for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock details for ${symbol} loaded from API`);

	try {
		// reload data
		const details = await reloadDetails(symbol);

		// save into cache
		env.get_stock_data.put(key, JSON.stringify(details), { expirationTtl: EXPIRATION_ONE_WEEK });

		// return data
		return new Response(JSON.stringify(details), RESPONSE_HEADER);
	} catch (e) {
		console.log(`Unable to Provide data for symbol=${symbol}`);
		return new Response(`Unable to Provide data for symbol=${symbol}`, { status: 400 });
	}
};

/**
 *
 * @param symbol
 * @returns reloaded all details for symbol from APIs
 */
const reloadDetails = async (symbol: string): Promise<StockDetailsAPI> => {
	const [
		companyOutlook,
		esgRatingYearly,
		eSGDataQuarterly,
		upgradesDowngrades,
		priceTarget,
		analystEstimatesEarnings,
		sectorPeers,
		recommendationTrends,
		companyKeyMetricsTTM,
		enterpriseValue,
	] = await Promise.all([
		getCompanyOutlook(symbol),
		getEsgRatingYearly(symbol),
		getEsgDataQuarterly(symbol),
		getUpgradesDowngrades(symbol),
		getPriceTarget(symbol),
		getStockHistoricalEarnings(symbol),
		getSectorPeersForSymbols([symbol]),
		getRecommendationTrends(symbol),
		getCompanyKeyMetricsTTM(symbol),
		getEnterpriseValue(symbol),
	]);

	const sheetIncomeYearly = companyOutlook.financialsAnnual.income.at(0);
	const sheetBalanceQuarter = companyOutlook.financialsQuarter.balance.at(0);
	const sheetCashYearly = companyOutlook.financialsAnnual.cash.at(0);
	const sheetCashflowQuarter = companyOutlook.financialsQuarter.cash.at(0);

	const result = {
		companyOutlook,
		ratio: companyOutlook.ratios[0] ?? null,
		rating: companyOutlook.rating[0] ?? null,
		upgradesDowngrades: upgradesDowngrades.slice(0, 15),
		priceTarget: priceTarget.slice(0, 15),
		stockEarnings: analystEstimatesEarnings,
		sectorPeers: sectorPeers[0] ?? null,
		recommendationTrends: recommendationTrends.slice().reverse(),
		companyKeyMetricsTTM: companyKeyMetricsTTM,
		esgDataQuarterly: eSGDataQuarterly[0],
		esgDataQuarterlyArray: eSGDataQuarterly.slice(0, 10),
		esgDataRatingYearly: esgRatingYearly[0],
		esgDataRatingYearlyArray: esgRatingYearly.slice(0, 10),
		enterpriseValue: enterpriseValue,
		additionalFinancialData: {
			cashOnHand: sheetBalanceQuarter?.cashAndShortTermInvestments ?? null,
			costOfRevenue: sheetIncomeYearly?.costOfRevenue ?? null,
			EBITDA: sheetIncomeYearly?.ebitda ?? null,
			freeCashFlow: sheetCashflowQuarter?.freeCashFlow ?? null,
			netIncome: sheetIncomeYearly?.netIncome ?? null,
			revenue: sheetIncomeYearly?.revenue ?? null,
			operatingCashFlow: sheetCashflowQuarter?.operatingCashFlow ?? null,
			totalAssets: sheetBalanceQuarter?.totalAssets ?? null,
			totalCurrentAssets: sheetBalanceQuarter?.totalCurrentAssets ?? null,
			totalDebt: sheetBalanceQuarter?.totalDebt ?? null,
			shortTermDebt: sheetBalanceQuarter?.shortTermDebt ?? null,
			stockBasedCompensation: sheetCashflowQuarter?.stockBasedCompensation ?? null,
			dividends: sheetCashYearly
				? {
						dividendsPaid: sheetCashYearly.dividendsPaid,
						dividendPerShareTTM: companyOutlook.ratios[0]?.dividendPerShareTTM,
						dividendYielPercentageTTM: companyOutlook.ratios[0]?.dividendYielPercentageTTM,
						dividendYielTTM: companyOutlook.ratios[0]?.dividendYielTTM,
						payoutRatioTTM: companyOutlook.ratios[0]?.payoutRatioTTM,
				  }
				: null,
		},
	} satisfies StockDetailsAPI;

	return result;
};
