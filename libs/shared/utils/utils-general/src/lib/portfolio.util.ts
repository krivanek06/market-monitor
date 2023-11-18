import {
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingPartial,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolSummary,
} from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from './date-service.util';
import { roundNDigits } from './general-function.util';

export const getPortfolioStateHoldingsUtil = (
  startingCash: number,
  transactions: PortfolioTransaction[],
  partialHoldings: PortfolioStateHoldingPartial[],
  symbolSummaries: SymbolSummary[],
): PortfolioStateHoldings => {
  // accumulate cash on hand from transactions
  const cashOnHandTransactions = transactions.reduce(
    (acc, curr) =>
      curr.transactionType === 'BUY' ? acc - curr.unitPrice * curr.units : acc + curr.unitPrice * curr.units,
    0,
  );
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

  console.log(`Getting Summaries: sending ${partialHoldings.length}, receiving: ${symbolSummaries.length}`);

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
        symbolSummary,
      } satisfies PortfolioStateHolding;
    })
    .filter((d) => !!d) as PortfolioStateHolding[];

  const invested = portfolioStateHolding.reduce((acc, curr) => acc + curr.invested, 0);
  const balance = invested + startingCash + cashOnHandTransactions;
  const holdingsBalance = portfolioStateHolding.reduce(
    (acc, curr) => acc + curr.symbolSummary.quote.price * curr.units,
    0,
  );
  const totalGainsValue = holdingsBalance - invested;
  const totalGainsPercentage = (holdingsBalance - invested) / holdingsBalance;
  const firstTransactionDate = transactions.length > 0 ? transactions[0].date : null;
  const lastTransactionDate = transactions.length > 0 ? transactions[transactions.length - 1].date : null;

  const result: PortfolioState = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees, 2),
    cashOnHand: roundNDigits(startingCash + cashOnHandTransactions, 2),
    balance: roundNDigits(balance, 2),
    invested: roundNDigits(invested, 2),
    holdingsBalance: roundNDigits(holdingsBalance, 2),
    totalGainsValue: roundNDigits(totalGainsValue, 2),
    totalGainsPercentage: roundNDigits(totalGainsPercentage, 6),
    startingCash: roundNDigits(startingCash, 2),
    firstTransactionDate,
    lastTransactionDate,
    modifiedDate: getCurrentDateDefaultFormat(),
  };

  return {
    ...result,
    holdings: portfolioStateHolding,
  };
};

/**
 * get partial data for user's current holdings from all previous transactions, where units are more than 0
 *
 * @param transactions - user's transactions
 * @returns
 */
export const getPortfolioStateHoldingPartialUtil = (
  transactions: PortfolioTransaction[],
): PortfolioStateHoldingPartial[] => {
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
          invested: curr.unitPrice * curr.units,
        } satisfies PortfolioStateHoldingPartial,
      ];
    }, [] as PortfolioStateHoldingPartial[])
    .filter((d) => d.units > 0);
};
