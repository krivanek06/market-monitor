import { getSymbolSummaries } from '@market-monitor/api-external';
import { userDocumentTransactionHistoryRef, usersCollectionRef } from '@market-monitor/api-firebase';
import { PortfolioState, PortfolioTransaction, SymbolType, UserPortfolioTransaction } from '@market-monitor/api-types';
import { getDefaultDateFormat, roundNDigits } from '@market-monitor/shared/utils-general';
import { format, subDays } from 'date-fns';

type PortfolioStateHoldingPartial = {
  symbolType: SymbolType;
  symbol: string;
  units: number;
  /**
   * how much user invested. Used to calculate BEP.
   */
  invested: number;
};

/**
 * for each user who is active and have SIMULATION role,
 * calculate portfolio state at the end of the day.
 *
 * functions runs multiple time to make sure all users are processed.
 * Select only N users at a time to prevent timeout.
 *
 * At every 5th minute past every hour from 1 through 2am
 */
export const executeUserPortfolioUpdate = async (): Promise<void> => {
  const today = getDefaultDateFormat();
  const twoWeeksBefore = format(subDays(new Date(), 14), 'yyyy-MM-dd');

  // load users to calculate balance
  const userToUpdate = usersCollectionRef()
    .where('role', '==', 'SIMULATION')
    // .where('lastLoginDate', '>=', twoWeeksBefore) // not able to use this filter
    .where('lastPortfolioStateModifiedDate', '!=', today)
    .orderBy('lastPortfolioStateModifiedDate', 'desc')
    .orderBy('lastLoginDate', 'desc')
    .limit(200);

  const users = await userToUpdate.get();

  console.log('Loaded: ', users.docs.length);

  // loop though users, load transactions and calculate balance
  for await (const userDoc of users.docs) {
    // load transaction per user
    const transactionRef = userDocumentTransactionHistoryRef(userDoc.id);
    const transactions = (await transactionRef.get()).data();
    const user = userDoc.data();

    try {
      // get portfolio state
      const portfolioState = await getPortfolioState(user.lastPortfolioState.cashOnHand, transactions);

      // update user
      userDoc.ref.update({
        lastPortfolioState: portfolioState,
        lastPortfolioStateModifiedDate: today,
      });

      // log
      console.log(`Updated user: ${user.personal.displayName}, ${userDoc.id}`);
    } catch (e) {
      console.warn(`Error for user: ${user.personal.displayName}, ${userDoc.id}: ${e}`);
    }

    console.log('Finished');
  }
};

const getPortfolioState = async (
  cashOnHandFromDeposit: number,
  portfolioTransactions: UserPortfolioTransaction,
): Promise<PortfolioState> => {
  const transactions = portfolioTransactions.transactions;

  // accumulate cash on hand from transactions
  const cashOnHandTransactions = transactions.reduce(
    (acc, curr) =>
      curr.transactionType === 'BUY' ? acc - curr.unitPrice * curr.units : acc + curr.unitPrice * curr.units,
    0,
  );
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

  // get partial holdings calculations
  const partialHoldings = getPortfolioStateHoldingPartial(transactions);
  const partialHoldingSymbols = partialHoldings.map((d) => d.symbol);

  // get symbol summaries from API
  const summaries = await getSymbolSummaries(partialHoldingSymbols);

  console.log(`Getting Summaries: sending ${partialHoldings.length}, receiving: ${summaries.length}`);

  const holdings = summaries.map((symbolSummary) => {
    const holding = partialHoldings.find((d) => d.symbol === symbolSummary.id);
    if (!holding) {
      console.log(`Holding not found for symbol ${symbolSummary.id}`);
      return null;
    }
    return {
      ...holding,
      symbolSummary,
    };
  });

  const invested = holdings.reduce((acc, curr) => acc + curr.invested, 0);
  const userBalance = invested + cashOnHandFromDeposit + cashOnHandTransactions;
  const holdingsBalance = holdings.reduce((acc, curr) => acc + curr.symbolSummary.quote.price * curr.units, 0);
  const totalGainsValue = holdingsBalance - invested;
  const totalGainsPercentage = (holdingsBalance - invested) / holdingsBalance;
  const firstTransactionDate = transactions[0].date;
  const lastTransactionDate = transactions[transactions.length - 1].date;

  const result: PortfolioState = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees, 2),
    cashOnHand: roundNDigits(cashOnHandFromDeposit + cashOnHandTransactions, 2),
    userBalance: roundNDigits(userBalance, 2),
    invested: roundNDigits(invested, 2),
    holdingsBalance: roundNDigits(holdingsBalance, 2),
    totalGainsValue: roundNDigits(totalGainsValue, 2),
    totalGainsPercentage: roundNDigits(totalGainsPercentage, 6),
    startingCash: roundNDigits(cashOnHandFromDeposit, 2),
    firstTransactionDate,
    lastTransactionDate,
  };

  return result;
};

/**
 * get partial data for user's current holdings from all previous transactions, where units are more than 0
 *
 * @param transactions - user's transactions
 * @returns
 */
const getPortfolioStateHoldingPartial = (transactions: PortfolioTransaction[]): PortfolioStateHoldingPartial[] => {
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
