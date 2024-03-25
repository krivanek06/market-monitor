import {
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolSummary,
} from '@mm/api-types';
import { isSameDay, subDays } from 'date-fns';
import { getCurrentDateDefaultFormat } from './date-service.util';
import { calculateGrowth, roundNDigits } from './general-function.util';

export const getPortfolioStateHoldingsUtil = (
  previousPortfolioState: PortfolioState,
  transactions: PortfolioTransaction[],
  partialHoldings: PortfolioStateHoldingBase[],
  symbolSummaries: SymbolSummary[],
): PortfolioStateHoldings => {
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

  console.log(`Getting Summaries: sending ${partialHoldings.length}, receiving: ${symbolSummaries.length}`);

  // value that user invested in all assets
  const invested = partialHoldings.reduce((acc, curr) => acc + curr.invested, 0);

  const portfolioStateHolding = symbolSummaries
    .map((symbolSummary) => {
      const holding = partialHoldings.find((d) => d.symbol === symbolSummary.id);
      if (!holding) {
        console.log(`Holding not found for symbol ${symbolSummary.id}`);
        return null;
      }
      return {
        ...holding,
        breakEvenPrice: roundNDigits(holding.invested / holding.units, 2),
        weight: roundNDigits(holding.invested / invested, 6),
        symbolSummary,
      } satisfies PortfolioStateHolding;
    })
    .filter((d) => !!d) as PortfolioStateHolding[];

  // sort holdings by balance
  const portfolioStateHoldingSortedByBalance = [...portfolioStateHolding].sort(
    (a, b) => b.symbolSummary.quote.price * b.units - a.symbolSummary.quote.price * a.units,
  );

  // value of all assets
  const holdingsBalance =
    portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolSummary.quote.price * curr.units, 0) - transactionFees;

  // current cash on hand
  const startingCash = previousPortfolioState.startingCash;
  const cashOnHandTransactions = startingCash !== 0 ? startingCash - invested - transactionFees : 0;

  const balance = holdingsBalance + cashOnHandTransactions;
  const totalGainsValue = startingCash !== 0 ? balance - startingCash : holdingsBalance - invested;
  const totalGainsPercentage = holdingsBalance === 0 ? 0 : calculateGrowth(balance, invested + cashOnHandTransactions);
  const firstTransactionDate = transactions.length > 0 ? transactions[0].date : null;
  const lastTransactionDate = transactions.length > 0 ? transactions[transactions.length - 1].date : null;

  // check if previous portfolio was done yesterday
  const isPreviousPortfolioDoneYesterday = isSameDay(new Date(previousPortfolioState.date), subDays(new Date(), 1));

  const result: PortfolioState = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees),
    cashOnHand: roundNDigits(cashOnHandTransactions),
    balance: roundNDigits(balance),
    invested: roundNDigits(invested),
    holdingsBalance: roundNDigits(holdingsBalance),
    totalGainsValue: roundNDigits(totalGainsValue),
    totalGainsPercentage: roundNDigits(totalGainsPercentage, 4),
    startingCash: roundNDigits(startingCash),
    firstTransactionDate,
    lastTransactionDate,
    date: getCurrentDateDefaultFormat(),
    // calculate data for previous portfolio
    previousBalanceChange:
      isPreviousPortfolioDoneYesterday && previousPortfolioState.balance !== 0
        ? roundNDigits(balance - previousPortfolioState.balance)
        : 0,
    previousBalanceChangePercentage: isPreviousPortfolioDoneYesterday
      ? calculateGrowth(balance, previousPortfolioState.balance)
      : 0,
    accountResetDate: previousPortfolioState.accountResetDate,
    portfolioRisk: previousPortfolioState.portfolioRisk,
  };

  return {
    ...result,
    holdings: portfolioStateHoldingSortedByBalance,
  };
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
        existingHolding.invested += curr.unitPrice * curr.units * (isSell ? -1 : 1);
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
          units: curr.units,
          invested: roundNDigits(curr.unitPrice * curr.units),
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
    accountResetDate: getCurrentDateDefaultFormat(),
  }) satisfies PortfolioState;
