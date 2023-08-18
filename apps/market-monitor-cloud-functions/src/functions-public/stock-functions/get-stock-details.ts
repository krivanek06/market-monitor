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
import { getDatabaseStockDetailsRef } from '@market-monitor/api-firebase';
import { CompanyOutlook, StockDetails, StockDetailsAPI, StockSummary } from '@market-monitor/api-types';
import { ForcefullyOmit } from '@market-monitor/shared-utils-general';
import { isBefore, subDays } from 'date-fns';
import { Request, Response } from 'express';
import { getSummary } from '../../shared';

/**
 * returns symbols details based on provided symbol in query
 */
export const getStockDetailsWrapper = async (request: Request, response: Response<StockDetails | string>) => {
  const symbolString = request.query.symbol as string;
  const reloadParam = request.query.reload === 'true' ? true : false;

  // throw error if no symbols
  if (!symbolString) {
    response.status(400).send('No symbol found in query params');
    return;
  }

  // load summary
  const summary = await getSummary(symbolString);
  const reload = reloadParam ?? summary.reloadDetailsData;

  // prevent loading data for etf and funds
  if (summary.profile.isEtf || summary.profile.isFund) {
    response.status(400).send('Unable to get details for FUND or ETF');
    return;
  }

  // data will be always present, if symbol does not exist, it already failed on summary
  const details = await getStockDetailsAPI(symbolString, reload);
  const formattedDetails = modifyDetailsAPItoStockDetails(summary, details);

  response.send(formattedDetails);
};

/**
 *
 * @param symbol
 * @returns data from database or reload them from API and update DB
 */
const getStockDetailsAPI = async (symbol: string, reload: boolean = false): Promise<StockDetailsAPI> => {
  // create DB calls
  const databaseStockDetailsRef = getDatabaseStockDetailsRef(symbol);

  // map to data format
  const databaseStockDetailsData = (await databaseStockDetailsRef.get()).data();

  if (
    // data exists
    databaseStockDetailsData &&
    // no manual reload
    !reload &&
    // data is not older than 7 days
    !isBefore(new Date(databaseStockDetailsData.lastUpdate.detailsLastUpdate), subDays(new Date(), 7))
  ) {
    return databaseStockDetailsData;
  }

  const fetchedStockDetailsData = await reloadDetails(symbol);

  // save data into firestore
  await databaseStockDetailsRef.set(fetchedStockDetailsData);

  // return data from DB
  return fetchedStockDetailsData;
};

const modifyDetailsAPItoStockDetails = (summary: StockSummary, details: StockDetailsAPI): StockDetails => {
  const ratio = details.companyOutlook.ratios[0];
  const rating = details.companyOutlook.rating[0];
  const companyOutlook = details.companyOutlook as ForcefullyOmit<CompanyOutlook, 'ratios' | 'rating'>;
  const sheetIncomeYearly = details.companyOutlook.financialsAnnual.income[0];
  const sheetBalanceQuarter = details.companyOutlook.financialsQuarter.balance[0];
  const sheetCashYearly = details.companyOutlook.financialsAnnual.cash[0];
  const sheetCashflowQuarter = details.companyOutlook.financialsQuarter.cash[0];

  const result = {
    ...summary,
    reloadData: false,
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
