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
	getSymbolSummary,
	getUpgradesDowngrades,
} from '@market-monitor/api-external';
import {
	CompanyOutlook,
	EXPIRATION_ONE_WEEK,
	RESPONSE_HEADER,
	StockDetails,
	StockDetailsAPI,
	StockSummary,
} from '@market-monitor/api-types';
import { ForcefullyOmit } from '@market-monitor/shared-utils-general';
import { Env } from './model';

export const getStockDetailsWrapper = async (env: Env, symbol: string, searchParams: URLSearchParams): Promise<Response> => {
	const reloadParam = searchParams.get('reload') === 'true' ? true : false;

	// load summary
	const summary = await getSymbolSummary(symbol);

	// invalid symbol
	if (!summary || !summary.profile) {
		return new Response('Invalid symbol', { status: 400 });
	}

	// prevent loading data for etf and funds
	if (summary.profile.isEtf || summary.profile.isFund) {
		return new Response('Unable to get details for FUND or ETF', { status: 400 });
	}

	// crate cache key
	const key = `${symbol}_details`;

	// check data in cache
	const cachedData = await env.get_stock_data.get(key);
	if (cachedData && !reloadParam) {
		console.log(`Stock details for ${symbol} loaded from cache`);
		return new Response(cachedData, RESPONSE_HEADER);
	}

	console.log(`Stock details for ${symbol} loaded from API`);

	// reload data
	const details = await reloadDetails(symbol);
	const formattedDetails = modifyDetailsAPItoStockDetails(summary, details);

	// save into cache
	env.get_stock_data.put(key, JSON.stringify(formattedDetails), { expirationTtl: EXPIRATION_ONE_WEEK });

	// return data
	return new Response(JSON.stringify(formattedDetails), RESPONSE_HEADER);
};

const modifyDetailsAPItoStockDetails = (summary: StockSummary, details: StockDetailsAPI): StockDetails => {
	const ratio = details.companyOutlook.ratios[0];
	const rating = details.companyOutlook.rating[0];
	const companyOutlook = details.companyOutlook as any as ForcefullyOmit<CompanyOutlook, 'ratios' | 'rating'>;
	const sheetIncomeYearly = details.companyOutlook.financialsAnnual.income[0];
	const sheetBalanceQuarter = details.companyOutlook.financialsQuarter.balance[0];
	const sheetCashYearly = details.companyOutlook.financialsAnnual.cash[0];
	const sheetCashflowQuarter = details.companyOutlook.financialsQuarter.cash[0];

	const result = {
		...summary,
		companyOutlook,
		ratio,
		rating,
		upgradesDowngrades: details.upgradesDowngrades,
		priceTarget: details.priceTarget,
		stockEarnings: details.stockEarnings,
		sectorPeers: details.sectorPeers,
		recommendationTrends: details.recommendationTrends.slice().reverse(),
		companyKeyMetricsTTM: details.companyKeyMetricsTTM,
		esgDataQuarterly: details.esgDataQuarterly,
		esgDataQuarterlyArray: details.esgDataQuarterlyArray,
		esgDataRatingYearly: details.esgDataRatingYearly,
		esgDataRatingYearlyArray: details.esgDataRatingYearlyArray,
		enterpriseValue: details.enterpriseValue,
		lastUpdate: details.lastUpdate,
		additionalFinancialData: {
			cashOnHand: sheetBalanceQuarter.cashAndShortTermInvestments,
			costOfRevenue: sheetIncomeYearly.costOfRevenue,
			EBITDA: sheetIncomeYearly.ebitda,
			freeCashFlow: sheetCashflowQuarter.freeCashFlow,
			netIncome: sheetIncomeYearly.netIncome,
			revenue: sheetIncomeYearly.revenue,
			operatingCashFlow: sheetCashflowQuarter.operatingCashFlow,
			totalAssets: sheetBalanceQuarter.totalAssets,
			totalCurrentAssets: sheetBalanceQuarter.totalCurrentAssets,
			totalDebt: sheetBalanceQuarter.totalDebt,
			shortTermDebt: sheetBalanceQuarter.shortTermDebt,
			stockBasedCompensation: sheetCashflowQuarter.stockBasedCompensation,
			dividends: {
				dividendsPaid: sheetCashYearly.dividendsPaid,
				dividendPerShareTTM: ratio.dividendPerShareTTM,
				dividendYielPercentageTTM: ratio.dividendYielPercentageTTM,
				dividendYielTTM: ratio.dividendYielTTM,
				payoutRatioTTM: ratio.payoutRatioTTM,
			},
		},
	} satisfies StockDetails;

	return result;
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

	const result: StockDetailsAPI = {
		companyOutlook,
		esgDataQuarterlyArray: eSGDataQuarterly.slice(0, 10),
		esgDataQuarterly: eSGDataQuarterly[0],
		esgDataRatingYearlyArray: esgRatingYearly.slice(0, 10),
		esgDataRatingYearly: esgRatingYearly[0],
		stockEarnings: analystEstimatesEarnings,
		priceTarget: priceTarget.slice(0, 15),
		sectorPeers: sectorPeers[0] ?? null,
		upgradesDowngrades: upgradesDowngrades.slice(0, 15),
		recommendationTrends,
		companyKeyMetricsTTM,
		enterpriseValue,
		lastUpdate: {
			detailsLastUpdate: new Date().toISOString(),
			earningLastUpdate: new Date().toISOString(),
		},
	};

	return result;
};
