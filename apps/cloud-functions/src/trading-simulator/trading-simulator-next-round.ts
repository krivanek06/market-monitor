import {
  FieldValuePartial,
  PortfolioGrowth,
  SymbolQuote,
  TradingSimulator,
  TradingSimulatorAggregationSymbols,
  TradingSimulatorParticipant,
} from '@mm/api-types';
import {
  getCurrentDateDetailsFormat,
  getPortfolioStateHoldingsUtil,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import { addMinutes } from 'date-fns';
import { FieldValue } from 'firebase-admin/firestore';
import {
  tradingSimulatorAggregationParticipantsDocRef,
  tradingSimulatorAggregationSymbolsDocRef,
  tradingSimulatorAggregationTransactionsDocRef,
  tradingSimulatorDocRef,
  tradingSimulatorParticipantsCollectionRef,
  tradingSimulatorSymbolsCollectionRef,
  tradingSimulatorTransactionsCollectionRef,
} from '../database';

/**
 * simulator increments to the next round
 * - increments round
 * - update each participant's portfolio
 * - recalculate user ranking
 * - TODO: increment available cash for each participant
 * - TODO: increment issued units for symbol if issued on that round
 * - TODO: check if it is the last round then
 *    - TODO: remove transaction collection
 *    - TODO: (optional) make transaction aggregation data: on which round how many transaction for each symbol happened
 */
export const tradingSimulatorOnNextRound = async (simulator: TradingSimulator) => {
  const transactionCollectionRef = tradingSimulatorTransactionsCollectionRef(simulator.id);
  const symbolsData = (await tradingSimulatorSymbolsCollectionRef(simulator.id).get()).docs.map((doc) => doc.data());
  const aggregationSymbol = (await tradingSimulatorAggregationSymbolsDocRef(simulator.id).get()).data();
  const participants = (await tradingSimulatorParticipantsCollectionRef(simulator.id).get()).docs.map((doc) =>
    doc.data(),
  );
  // format: { userId: current rank }
  const participantsRanking = (
    (await tradingSimulatorAggregationParticipantsDocRef(simulator.id).get()).data()?.userRanking ?? []
  ).reduce(
    (acc, curr) => ({
      ...acc,
      [curr.userData.id]: curr.rank.rank,
    }),
    {} as { [K in string]: number },
  );

  const nextRound = simulator.currentRound + 1;

  // load transactions
  const lastTransactions = await transactionCollectionRef.orderBy('dateExecuted', 'desc').limit(100).get();
  const bestTransactions = await transactionCollectionRef
    .where('returnValue', '>', 0)
    .orderBy('returnValue', 'desc')
    .limit(15)
    .get();
  const worstTransactions = await transactionCollectionRef
    .where('returnValue', '<', 0)
    .orderBy('returnValue', 'desc')
    .limit(15)
    .get();

  // update symbol prices
  const symbolPricesUpdated = Object.entries(aggregationSymbol ?? {}).reduce(
    (acc, [symbol, data]) => ({
      ...acc,
      [symbol]: {
        ...data,
        price: symbolsData.find((d) => d.symbol === symbol)?.historicalDataModified.at(simulator.currentRound) ?? 0,
      } satisfies TradingSimulatorAggregationSymbols[0],
    }),
    {} as TradingSimulatorAggregationSymbols,
  );

  // I need this format to make some calculations, but data is not stored in DB
  const symbolPriceQuoteFormat = Object.entries(symbolPricesUpdated).map(
    ([symbol, data]) =>
      ({
        symbol,
        price: data.price,
      }) as SymbolQuote,
  );

  // update each participant data
  const participantsUpdatedSorted = participants
    .map((participant) => {
      const portfolioStateHolding = getPortfolioStateHoldingsUtil(participant.transactions, symbolPriceQuoteFormat, []);

      const holdings = portfolioStateHolding.holdings;
      const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHolding);
      const portfolioGrowth = [
        ...participant.portfolioGrowth,
        {
          date: String(nextRound),
          balanceTotal: portfolioState.balance,
          investedTotal: portfolioState.invested,
          marketTotal: portfolioState.holdingsBalance,
        } satisfies PortfolioGrowth,
      ];

      return {
        ...participant,
        portfolioState,
        holdings,
        portfolioGrowth,
      };
    })
    .sort((a, b) => b.portfolioState.balance - a.portfolioState.balance)
    .map(
      (participant, index) =>
        ({
          ...participant,
          rank: {
            rank: index + 1,
            rankPrevious: participantsRanking[participant.userData.id] ?? 0,
            rankChange: (participantsRanking[participant.userData.id] ?? 0) - (index + 1),
            date: String(nextRound),
          },
        }) satisfies TradingSimulatorParticipant,
    );

  // update aggregation data
  tradingSimulatorAggregationTransactionsDocRef(simulator.id).set({
    bestTransactions: bestTransactions.docs.map((doc) => doc.data()),
    worstTransactions: worstTransactions.docs.map((doc) => doc.data()),
    lastTransactions: lastTransactions.docs.map((doc) => doc.data()),
  });

  // update simulator data
  tradingSimulatorDocRef(simulator.id).update({
    nextRoundTime: getCurrentDateDetailsFormat(addMinutes(simulator.nextRoundTime, simulator.oneRoundDurationMinutes)),
    currentRound: FieldValue.increment(1),
  } satisfies FieldValuePartial<TradingSimulator>);

  // update prices for each symbol
  tradingSimulatorAggregationSymbolsDocRef(simulator.id).update(symbolPricesUpdated);

  // update each participant's data
  for (const participant of participantsUpdatedSorted) {
    tradingSimulatorParticipantsCollectionRef(simulator.id)
      .doc(participant.userData.id)
      .update({
        portfolioState: participant.portfolioState,
        holdings: participant.holdings,
        portfolioGrowth: FieldValue.arrayUnion(participant.portfolioGrowth.at(-1)),
        rank: participant.rank,
      } satisfies FieldValuePartial<TradingSimulatorParticipant>);
  }

  // recalculate user ranking
  tradingSimulatorAggregationParticipantsDocRef(simulator.id).set({
    userRanking: participantsUpdatedSorted.map((participant) => ({
      userData: participant.userData,
      portfolioState: participant.portfolioState,
      rank: participant.rank,
    })),
  });
};
