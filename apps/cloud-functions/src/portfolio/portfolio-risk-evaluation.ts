import { getHistoricalPricesCloudflare, getTreasuryRates } from '@market-monitor/api-external';
import {
  HistoricalPrice,
  PortfolioRisk,
  PortfolioStateHoldings,
  SYMBOL_SP500,
  SymbolHistoricalPeriods,
} from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat, roundNDigits } from '@market-monitor/shared/features/general-util';
import { divide, mean, pow, sqrt, std, variance } from 'mathjs';

type SymbolReturns = {
  prices: HistoricalPrice[];
  dailyReturns: number[];
  yearlyReturn: number;
};

/**
 * stores loaded data for symbols
 */
const symbolReturnMap = new Map<string, SymbolReturns>();

export const userPortfolioRisk = async (portfolioState: PortfolioStateHoldings): Promise<PortfolioRisk> => {
  const sp500Data = await getSymbolPricesAndReturn(SYMBOL_SP500);
  const treasureData = await getTreasuryRates();
  const riskFreeRate = treasureData[0].month3;

  try {
    // preload all symbol data and save to cache
    const symbolDataPromises = portfolioState.holdings.map((holding) => getSymbolPricesAndReturn(holding.symbol));
    await Promise.all(symbolDataPromises);

    // calculate metrics
    const { beta, alpha, sharpe } = await calculateMetricsForAllHoldings(portfolioState, sp500Data, riskFreeRate);

    // calculate portfolio volatility
    const volatility = await calculatePortfolioVolatility(portfolioState);

    console.log(`PortfolioVol: ${volatility}, Beta: ${beta}, Alpha: ${alpha}, Sharpe: ${sharpe}`);

    return {
      beta,
      alpha,
      sharpe,
      volatility,
      calculationDate: getCurrentDateDefaultFormat(),
    };
  } catch (error) {
    console.log(error);
    return {
      beta: 0,
      alpha: 0,
      sharpe: 0,
      volatility: 0,
      calculationDate: getCurrentDateDefaultFormat(),
    };
  }
};

export const calculateMetricsForAllHoldings = async (
  portfolioState: PortfolioStateHoldings,
  sp500Data: SymbolReturns,
  riskFreeRate: number,
): Promise<{
  beta: number;
  alpha: number;
  sharpe: number;
}> => {
  const metrics: {
    beta: number;
    alpha: number;
    sharpe: number;
  } = {
    alpha: 0,
    beta: 0,
    sharpe: 0,
  };

  for (const holding of portfolioState.holdings) {
    const symbolData = await getSymbolPricesAndReturn(holding.symbol);

    // Calculate metrics for each symbol
    const beta = await calculateBeta(sp500Data, symbolData);
    const alpha = calculateAlpha({ sp500Data, symbolData, riskFreeRate, beta });
    const sharpeRatio = calculateSharpeRatio(symbolData, riskFreeRate) ?? 0;

    console.log(`Symbol: ${holding.symbol}, beta: ${beta}, alpha: ${alpha}, sharpeRatio: ${sharpeRatio}`);

    // metrics.push({ symbol: holding.symbol, beta, alpha, sharpeRatio });
    metrics.alpha += alpha * holding.weight;
    metrics.beta += beta * holding.weight;
    metrics.sharpe += sharpeRatio * holding.weight;
  }

  return {
    alpha: roundNDigits(metrics.alpha, 6),
    beta: roundNDigits(metrics.beta, 6),
    sharpe: roundNDigits(metrics.sharpe, 6),
  };
};

const getSymbolPricesAndReturn = async (symbol: string): Promise<SymbolReturns> => {
  // check in cache
  const savedData = symbolReturnMap.get(symbol);
  if (savedData) {
    return savedData;
  }

  const prices = await getHistoricalPricesCloudflare(symbol, SymbolHistoricalPeriods.year);
  const yearlyReturn = (prices[prices.length - 1].close - prices[0].close) / prices[0].close;
  const dailyReturns = prices
    .map((price, index, arr) => (index > 0 ? (price.close - arr[index - 1].close) / arr[index - 1].close : 0))
    // filter out first result
    .slice(1);

  // format
  const data = { prices, yearlyReturn, dailyReturns };
  // save
  symbolReturnMap.set(symbol, data);
  // return data
  return data;
};

const calculatePortfolioVolatility = async (portfolioState: PortfolioStateHoldings): Promise<number> => {
  // Assuming holdings is an array of { symbol, weight }
  const totalWeights = portfolioState.holdings.reduce((total, holding) => total + holding.weight, 0);

  if (totalWeights === 0) {
    throw new Error('Total weight of holdings cannot be zero');
  }

  let portfolioVariance = 0;

  // Calculate portfolio variance
  for (let i = 0; i < portfolioState.holdings.length; i++) {
    for (let j = 0; j < portfolioState.holdings.length; j++) {
      const weightI = portfolioState.holdings[i].weight;
      const weightJ = portfolioState.holdings[j].weight;
      const symbolReturnI = await getSymbolPricesAndReturn(portfolioState.holdings[i].symbol);
      const symbolReturnJ = await getSymbolPricesAndReturn(portfolioState.holdings[j].symbol);

      const covIJ =
        i === j
          ? pow(std(symbolReturnI.dailyReturns), 2)
          : calculateCovariance(symbolReturnI.dailyReturns, symbolReturnJ.dailyReturns);
      portfolioVariance += weightI * weightJ * Number(covIJ);
    }
  }

  // Calculate portfolio standard deviation (volatility)
  const portfolioVolatility = sqrt(portfolioVariance);

  return Number(portfolioVolatility);
};

const calculateSharpeRatio = (symbolReturn: SymbolReturns, riskFreeRate: number): number | null => {
  const { prices, yearlyReturn } = symbolReturn;

  // not enough data
  if (prices.length < 2) {
    return null;
  }

  // Calculate daily returns
  const dailyReturns = prices
    .map((price, index, arr) => {
      return index > 0 ? (price.close - arr[index - 1].close) / arr[index - 1].close : 0;
    })
    .filter((_, index) => index > 0);

  // Calculate the mean of daily returns
  const meanDailyReturn = mean(dailyReturns);

  // Convert the risk-free rate to a daily rate (assuming 252 trading days in a year)
  const dailyRiskFreeRate = (1 + riskFreeRate) ** (1 / 252) - 1;

  // Calculate the excess return
  const excessReturn = meanDailyReturn - dailyRiskFreeRate;

  // Calculate the standard deviation of the daily returns
  const stdDeviation = std(dailyReturns, 'uncorrected');

  // Calculate the Sharpe Ratio
  const sharpeRatio = divide(excessReturn, stdDeviation);

  return roundNDigits(Number(sharpeRatio), 6);
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

  return roundNDigits(alpha, 6);
};

/**
 * @returns - calculated beta for the past year
 */
const calculateBeta = async (sp500Data: SymbolReturns, symbolData: SymbolReturns): Promise<number> => {
  if (sp500Data.prices.length !== symbolData.prices.length) {
    throw new Error('Data arrays must be of the same length');
  }

  // calculate covariance
  const covarianceCalc = calculateCovariance(sp500Data.dailyReturns, symbolData.dailyReturns);

  // Calculate variance of market returns
  const varianceCalc = variance(sp500Data.dailyReturns);

  // Ensure variance is a single number
  if (Array.isArray(varianceCalc)) {
    throw new Error('Variance calculation returned an array instead of a single number.');
  }

  // Calculate beta
  const beta = covarianceCalc / varianceCalc;

  return roundNDigits(beta, 6);
};

const calculateCovariance = (returns1: number[], returns2: number[]): number => {
  if (returns1.length !== returns2.length) {
    throw new Error('Data arrays must be of the same length');
  }

  const mean1 = mean(returns1);
  const mean2 = mean(returns2);
  const sum = returns1.reduce((acc, r1, i) => acc + (r1 - mean1) * (returns2[i] - mean2), 0);
  return sum / (returns1.length - 1);
};
