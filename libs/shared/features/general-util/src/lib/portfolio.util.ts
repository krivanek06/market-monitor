import {
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolQuote,
} from '@mm/api-types';
import { getCurrentDateDefaultFormat, getCurrentDateDetailsFormat } from './date-service.util';
import { calculateGrowth, roundNDigits } from './general-function.util';

/**
 * calculates user's portfolio based on provided data. Used in Cloud Functions and on FE
 *
 * @param accountType - user's account type
 * @param transactions - user's transactions
 * @param partialHoldings - user's data for current holdings
 * @param symbolSummaries - loaded summaries for user's holdings
 * @returns
 */
export const getPortfolioStateHoldingsUtil = (
  transactions: PortfolioTransaction[],
  partialHoldings: PortfolioStateHoldingBase[],
  symbolQuotes: SymbolQuote[],
  startingCash = 0,
): PortfolioStateHoldings => {
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

  // value that user invested in all assets
  const investedTotal = partialHoldings.reduce((acc, curr) => acc + curr.invested, 0);

  // user's holdings with summary data
  const portfolioStateHolding = symbolQuotes
    .map((quote) => {
      const holding = partialHoldings.find((d) => d.symbol === quote.symbol);
      if (!holding) {
        console.log(`Holding not found for symbol ${quote.symbol}`);
        return null;
      }
      return {
        ...holding,
        breakEvenPrice: roundNDigits(holding.invested / holding.units),
        weight: roundNDigits(holding.invested / investedTotal, 6),
        symbolQuote: quote,
      } satisfies PortfolioStateHolding;
    })
    .filter((d) => !!d) as PortfolioStateHolding[];

  // sort holdings by balance
  const portfolioStateHoldingSortedByBalance = [...portfolioStateHolding].sort(
    (a, b) => b.symbolQuote.price * b.units - a.symbolQuote.price * a.units,
  );

  // value of all assets
  const holdingsBalance = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.price * curr.units, 0);

  // calculate profit/loss from created transactions
  const transactionProfitLoss = transactions.reduce((acc, curr) => acc + (curr?.returnValue ?? 0), 0);

  // current cash on hand
  const cashOnHandTransactions =
    (startingCash !== 0 ? startingCash - investedTotal - transactionFees : 0) + transactionProfitLoss;

  const balance = holdingsBalance + cashOnHandTransactions;
  const totalGainsValue = startingCash !== 0 ? balance - startingCash : holdingsBalance - investedTotal;
  const totalGainsPercentage =
    startingCash !== 0 ? calculateGrowth(balance, startingCash) : calculateGrowth(balance, investedTotal);
  const firstTransactionDate = transactions.length > 0 ? transactions[0].date : null;
  const lastTransactionDate = transactions.length > 0 ? transactions[transactions.length - 1].date : null;

  // calculate daily portfolio change
  const balanceChange = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.change * curr.units, 0);
  const balanceChangePrct = holdingsBalance === 0 ? 0 : calculateGrowth(balance, balance - balanceChange);

  const result: PortfolioStateHoldings = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees),
    cashOnHand: roundNDigits(cashOnHandTransactions),
    balance: roundNDigits(balance),
    invested: roundNDigits(investedTotal),
    holdingsBalance: roundNDigits(holdingsBalance),
    totalGainsValue: roundNDigits(totalGainsValue),
    totalGainsPercentage: roundNDigits(totalGainsPercentage, 4),
    startingCash: roundNDigits(startingCash),
    firstTransactionDate,
    lastTransactionDate,
    date: getCurrentDateDetailsFormat(),
    // calculate data for previous portfolio
    previousBalanceChange: balanceChange,
    previousBalanceChangePercentage: balanceChangePrct,
    holdings: portfolioStateHoldingSortedByBalance,
  };

  return result;
};

/**
 * get partial data for user's current holdings from all previous transactions, where units are more than 0
 *
 * @param transactions - user's transactions
 * @returns
 */
export const getPortfolioStateHoldingBaseUtil = (transactions: PortfolioTransaction[]): PortfolioStateHoldingBase[] => {
  return transactions
    .reduce((acc, curr) => {
      const existingHolding = acc.find((d) => d.symbol === curr.symbol);
      const isSell = curr.transactionType === 'SELL';
      // update existing holding
      if (existingHolding) {
        existingHolding.units += isSell ? -curr.units : curr.units;
        existingHolding.invested += isSell
          ? -(existingHolding.breakEvenPrice * curr.units)
          : curr.unitPrice * curr.units;
        existingHolding.breakEvenPrice = roundNDigits(existingHolding.invested / existingHolding.units);
        return acc;
      }

      // first value can not be sell
      if (isSell) {
        console.error('First transaction can not be sell');
      }

      // add new holding
      return [
        ...acc,
        {
          symbolType: curr.symbolType,
          symbol: curr.symbol,
          sector: curr.sector,
          units: curr.units,
          invested: roundNDigits(curr.unitPrice * curr.units),
          breakEvenPrice: curr.unitPrice,
        } satisfies PortfolioStateHoldingBase,
      ];
    }, [] as PortfolioStateHoldingBase[])
    .filter((d) => d.units > 0);
};

export const createEmptyPortfolioState = (startingCash = 0) =>
  ({
    balance: startingCash,
    cashOnHand: startingCash,
    holdingsBalance: 0,
    invested: 0,
    numberOfExecutedBuyTransactions: 0,
    numberOfExecutedSellTransactions: 0,
    startingCash: startingCash,
    transactionFees: 0,
    date: getCurrentDateDefaultFormat(),
    totalGainsPercentage: 0,
    totalGainsValue: 0,
    firstTransactionDate: null,
    lastTransactionDate: null,
    previousBalanceChange: 0,
    previousBalanceChangePercentage: 0,
  }) satisfies PortfolioState;

/**
 * transform PortfolioStateHoldings to PortfolioState
 */
export const transformPortfolioStateHoldingToPortfolioState = (holding: PortfolioStateHoldings): PortfolioState => {
  return {
    balance: holding.balance,
    cashOnHand: holding.cashOnHand,
    invested: holding.invested,
    numberOfExecutedBuyTransactions: holding.numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions: holding.numberOfExecutedSellTransactions,
    transactionFees: holding.transactionFees,
    holdingsBalance: holding.holdingsBalance,
    totalGainsValue: roundNDigits(holding.totalGainsValue, 2),
    totalGainsPercentage: roundNDigits(holding.totalGainsPercentage, 2),
    firstTransactionDate: holding.firstTransactionDate,
    lastTransactionDate: holding.lastTransactionDate,
    date: holding.date,
    startingCash: holding.startingCash,
    previousBalanceChange: holding.previousBalanceChange,
    previousBalanceChangePercentage: holding.previousBalanceChangePercentage,
  };
};
