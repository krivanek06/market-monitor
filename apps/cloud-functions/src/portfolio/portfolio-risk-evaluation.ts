import { getHistoricalPricesCloudflare, getTreasuryRates } from '@mm/api-external';
import {
  HistoricalPrice,
  PortfolioRisk,
  PortfolioStateHoldings,
  SYMBOL_SP500,
  SymbolHistoricalPeriods,
} from '@mm/api-types';
import { getCurrentDateDetailsFormat, roundNDigits } from '@mm/shared/general-util';
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
  // user has no holdings
  if (portfolioState.holdings.length === 0) {
    return createEmptyPortfolioRisk();
  }

  try {
    const sp500Data = await getSymbolPricesAndReturn(SYMBOL_SP500);
    const treasureData = await getTreasuryRates();
    const riskFreeRate = treasureData.at(0)?.month3 ?? 4.5; // fallback 4.5% treasury

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
      date: getCurrentDateDetailsFormat(),
    };
  } catch (error) {
    console.log(error);
    return createEmptyPortfolioRisk();
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

    const [sp500DataSlice, symbolDataSlice] = createSymbolReturnSlices(sp500Data, symbolData);

    // both should be around 250
    if (sp500DataSlice.prices.length !== symbolDataSlice.prices.length) {
      console.log('Symbol data length does not match S&P 500 data length');
      continue;
    }

    // Calculate metrics for each symbol
    const beta = await calculateBeta(sp500DataSlice, symbolDataSlice);
    const alpha = calculateAlpha({ sp500Data: sp500DataSlice, symbolData: symbolDataSlice, riskFreeRate, beta });
    const sharpeRatio = calculateSharpeRatio(symbolDataSlice, riskFreeRate) ?? 0;

    // calculate weighted average
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

/**
 * ensures that both data1 and data2 are the same length
 *
 * @param data1
 * @param data2
 */
const createSymbolReturnSlices = (data1: SymbolReturns, data2: SymbolReturns): [SymbolReturns, SymbolReturns] => {
  const data1Slice = {
    prices: data1.prices.slice(-data2.prices.length),
    dailyReturns: data1.dailyReturns.slice(-data2.dailyReturns.length),
    yearlyReturn: data1.yearlyReturn,
  } satisfies SymbolReturns;

  const data2Slice = {
    prices: data2.prices.slice(-data1.prices.length),
    dailyReturns: data2.dailyReturns.slice(-data1.dailyReturns.length),
    yearlyReturn: data2.yearlyReturn,
  } satisfies SymbolReturns;

  return [data1Slice, data2Slice];
};

const getSymbolPricesAndReturn = async (symbol: string): Promise<SymbolReturns> => {
  // check in cache
  const savedData = symbolReturnMap.get(symbol);
  if (savedData) {
    return savedData;
  }

  try {
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
  } catch (error) {
    console.log(`Error getting symbol prices and return for ${symbol}`, error);
    return { prices: [], dailyReturns: [], yearlyReturn: 0 };
  }
};

const calculatePortfolioVolatility = async (portfolioState: PortfolioStateHoldings): Promise<number> => {
  // Assuming holdings is an array of { symbol, weight }
  const totalWeights = portfolioState.holdings.reduce((total, holding) => total + holding.weight, 0);

  // happens when no holdings
  if (totalWeights === 0) {
    return 0;
  }

  let portfolioVariance = 0;

  // Calculate portfolio variance
  for (let i = 0; i < portfolioState.holdings.length; i++) {
    for (let j = 0; j < portfolioState.holdings.length; j++) {
      const weightI = portfolioState.holdings[i].weight;
      const weightJ = portfolioState.holdings[j].weight;
      const symbolReturnI = await getSymbolPricesAndReturn(portfolioState.holdings[i].symbol);
      const symbolReturnJ = await getSymbolPricesAndReturn(portfolioState.holdings[j].symbol);

      // make sure both data are the same length
      const [symbolReturnISlice, symbolReturnJSlice] = createSymbolReturnSlices(symbolReturnI, symbolReturnJ);

      const covIJ =
        i === j
          ? pow(std(symbolReturnISlice.dailyReturns), 2)
          : calculateCovariance(symbolReturnISlice.dailyReturns, symbolReturnJSlice.dailyReturns);

      portfolioVariance += weightI * weightJ * Number(covIJ);
    }
  }

  // Calculate portfolio standard deviation (volatility)
  const portfolioVolatility = roundNDigits(Number(sqrt(portfolioVariance)), 6);

  return portfolioVolatility;
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
  try {
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
  } catch (error) {
    console.log('Error calculating beta', error);
    return 0;
  }
};

const calculateCovariance = (returns1: number[], returns2: number[]): number => {
  const mean1 = mean(returns1);
  const mean2 = mean(returns2);
  const sum = returns1.reduce((acc, r1, i) => acc + (r1 - mean1) * (returns2[i] - mean2), 0);
  return sum / (returns1.length - 1);
};

const createEmptyPortfolioRisk = (): PortfolioRisk => {
  return {
    alpha: 0,
    beta: 0,
    sharpe: 0,
    volatility: 0,
    date: getCurrentDateDetailsFormat(),
  };
};
