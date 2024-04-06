import { getSymbolSummaries } from '@mm/api-external';
import {
  PortfolioRisk,
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolSummary,
  USER_LOGIN_ACCOUNT_ACTIVE_DAYS,
  UserData,
  UserPortfolioTransaction,
} from '@mm/api-types';
import { calculateGrowth, getCurrentDateDefaultFormat, roundNDigits } from '@mm/shared/general-util';
import { format, isSameDay, subDays } from 'date-fns';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { userDocumentRef } from '../models';
import { userPortfolioRisk } from './portfolio-risk-evaluation';

export const onTransactionUpdate = onDocumentUpdated('users/{userId}/more_information/transactions', async (event) => {
  const today = getCurrentDateDefaultFormat();
  const userId = event.params.userId;
  const newTransactions = (event.data?.after.data() as UserPortfolioTransaction)?.transactions ?? [];

  // load user
  const userRef = userDocumentRef(userId);
  const user = (await userRef.get()).data();

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  try {
    // get partial holdings calculations
    const holdingsBase = getPortfolioStateHoldingBaseUtil(newTransactions);

    // get symbol summaries from API
    const partialHoldingSymbols = holdingsBase.map((d) => d.symbol);
    const summaries = partialHoldingSymbols.length > 0 ? await getSymbolSummaries(partialHoldingSymbols) : [];

    // get portfolio state
    const portfolioStateHoldings = getPortfolioStateHoldingsUtil(
      user.portfolioState,
      newTransactions,
      holdingsBase,
      summaries,
    );

    // calculation risk of investment
    const portfolioRisk = await userPortfolioRisk(portfolioStateHoldings);

    // remove holdings
    const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHoldings, portfolioRisk);

    // account active threshold
    const accountActiveThreshold = format(subDays(new Date(), USER_LOGIN_ACCOUNT_ACTIVE_DAYS), 'yyyy-MM-dd');

    // update user
    userRef.update({
      portfolioState: portfolioState,
      holdingSnapshot: {
        data: holdingsBase,
        lastModifiedDate: today,
      },
      isAccountActive: user.lastLoginDate > accountActiveThreshold,
    } satisfies Partial<UserData>);

    // log
    console.log(`Updated user: ${user.personal.displayName}, ${user.id}`);
  } catch (e) {
    console.warn(`Error for user: ${user.personal.displayName}, ${user.id}: ${e}`);
  }
});

/**
 * transform PortfolioStateHoldings to PortfolioState
 */
const transformPortfolioStateHoldingToPortfolioState = (
  holding: PortfolioStateHoldings,
  portfolioRisk?: PortfolioRisk | null,
): PortfolioState => {
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
    accountResetDate: holding.accountResetDate,
    portfolioRisk: portfolioRisk ?? null,
  };
};

const getPortfolioStateHoldingsUtil = (
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
const getPortfolioStateHoldingBaseUtil = (transactions: PortfolioTransaction[]): PortfolioStateHoldingBase[] => {
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
