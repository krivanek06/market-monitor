import { getHistoricalPricesCloudflare, getTreasuryRates } from '@market-monitor/api-external';
import {
  HistoricalPrice,
  PortfolioRisk,
  PortfolioStateHoldings,
  SYMBOL_SP500,
  SymbolHistoricalPeriods,
} from '@market-monitor/api-types';
import { roundNDigits } from '@market-monitor/shared/features/general-util';
import { mean, variance } from 'mathjs';

type SymbolReturns = { prices: HistoricalPrice[]; yearlyReturn: number };

export const userPortfolioRisk = async (holdings: PortfolioStateHoldings): Promise<PortfolioRisk | null> => {
  const sp500Data = await getSymbolPricesAndReturn(SYMBOL_SP500);
  const treasureData = await getTreasuryRates();

  // TODO: move to a loop
  const symbolData = await getSymbolPricesAndReturn(holdings.holdings[0].symbol);

  // calculate beta
  const beta = await calculateBeta(sp500Data, symbolData);

  // calculate alpha
  const alpha = calculateAlpha({
    sp500Data,
    symbolData,
    riskFreeRate: treasureData[0].month3,
    beta,
  });

  console.log('beta', beta);
  console.log('alpha', alpha);
  return null;
};

const getSymbolPricesAndReturn = async (symbol: string): Promise<SymbolReturns> => {
  const prices = await getHistoricalPricesCloudflare(symbol, SymbolHistoricalPeriods.year);
  const yearlyReturn = (prices[prices.length - 1].close - prices[0].close) / prices[0].close;
  return { prices, yearlyReturn };
};

const calculateAlpha = (data: {
  sp500Data: SymbolReturns;
  symbolData: SymbolReturns;
  riskFreeRate: number;
  beta: number;
}): number => {
  const { sp500Data, symbolData, riskFreeRate, beta } = data;

  // Calculate Alpha
  const alpha = symbolData.yearlyReturn - riskFreeRate - beta * (sp500Data.yearlyReturn - riskFreeRate);

  return alpha;
};

/**
 * @returns - calculated beta for the past year
 */
const calculateBeta = async (sp500Data: SymbolReturns, symbolData: SymbolReturns): Promise<number> => {
  if (sp500Data.prices.length !== symbolData.prices.length) {
    throw new Error('Data arrays must be of the same length');
  }

  // Calculate daily returns
  const sp500Returns = sp500Data.prices.map((price, index, arr) =>
    index > 0 ? (price.close - arr[index - 1].close) / arr[index - 1].close : 0,
  );
  const symbolReturns = symbolData.prices.map((price, index, arr) =>
    index > 0 ? (price.close - arr[index - 1].close) / arr[index - 1].close : 0,
  );

  // Manually calculate covariance
  const meanSp500Returns = mean(sp500Returns);
  const meanSymbolReturns = mean(symbolReturns);
  const covarianceCalc = mean(
    sp500Returns.map((r, i) => (r - meanSp500Returns) * (symbolReturns[i] - meanSymbolReturns)),
  );

  // Calculate variance of market returns
  const varianceCalc = variance(sp500Returns);

  // Ensure variance is a single number
  if (Array.isArray(varianceCalc)) {
    throw new Error('Variance calculation returned an array instead of a single number.');
  }

  // Calculate beta
  const beta = covarianceCalc / varianceCalc;

  return roundNDigits(beta, 6);
};
