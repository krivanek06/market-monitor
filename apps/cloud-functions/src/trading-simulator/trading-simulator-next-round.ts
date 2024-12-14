import {
  FieldValuePartial,
  PortfolioGrowth,
  SymbolQuote,
  TradingSimulator,
  TradingSimulatorAggregationSymbols,
  TradingSimulatorAggregationSymbolsData,
  TradingSimulatorParticipant,
} from '@mm/api-types';
import {
  getCurrentDateIOSFormat,
  getPortfolioStateHoldingsUtil,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import { addMinutes, roundToNearestMinutes } from 'date-fns';
import { firestore } from 'firebase-admin';
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
 * - increment available cash for each participant
 * - increment issued units for symbol if issued on that round
 * - check if it is the last round then
 *    - remove transaction collection
 *    - TODO: (optional) make transaction aggregation data: on which round how many transaction for each symbol happened
 */
export const tradingSimulatorOnNextRound = async (simulator: TradingSimulator) => {
  // prevent running this function if the simulator is finished
  if (simulator.state === 'finished') {
    return;
  }

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

  const isFistRound = simulator.state === 'live' && simulator.currentRound === 0;
  const isLastRound = simulator.state === 'started' && simulator.currentRound === simulator.maximumRounds;

  // check if the last round is over
  if (isLastRound) {
    // update simulator data
    await tradingSimulatorDocRef(simulator.id).update({
      // round to nearest because may be some time differences when this is updated and when CF runs to update it again
      nextRoundTime: roundToNearestMinutes(addMinutes(new Date(), simulator.oneRoundDurationMinutes), {
        // casting should be ok because it expects a {Unit extends number}
        nearestTo: 5,
        roundingMethod: 'floor', // round down
      }).toISOString(),
      state: 'finished',
      endDateTime: getCurrentDateIOSFormat(),
    } satisfies FieldValuePartial<TradingSimulator>);

    // remove all transactions
    firestore().recursiveDelete(transactionCollectionRef);

    return;
  }

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
  const symbolAggregationUpdate = Object.entries(aggregationSymbol ?? {}).reduce((acc, [symbol, data]) => {
    const symbolSavedData = symbolsData.find((d) => d.symbol === symbol);
    const issuedUnits = symbolSavedData?.unitsAdditionalIssued ?? [];

    return {
      ...acc,
      [symbol]: {
        ...data,
        // save the previous price
        pricePrevious: data.price,
        // get the price from the historical data
        price: symbolSavedData?.historicalDataModified.at(nextRound - 1) ?? 0,
        // increment available units if issued on that round
        unitsCurrentlyAvailable:
          data.unitsCurrentlyAvailable + (issuedUnits.find((d) => d.issuedOnRound === nextRound)?.units ?? 0),
        unitsTotalAvailable:
          data.unitsTotalAvailable + (issuedUnits.find((d) => d.issuedOnRound === nextRound)?.units ?? 0),
      } satisfies TradingSimulatorAggregationSymbolsData,
    };
  }, {} as TradingSimulatorAggregationSymbols);

  // I need this format to make some calculations, but data is not stored in DB
  const symbolPriceQuoteFormat = Object.entries(symbolAggregationUpdate).map(
    ([symbol, data]) =>
      ({
        symbol,
        price: data.price,
      }) as SymbolQuote,
  );

  // get additional cash issued on all previous rounds
  const additionalCashOnRound = simulator.cashAdditionalIssued
    .filter((d) => d.issuedOnRound <= nextRound)
    .reduce((acc, curr) => acc + curr.value, 0);

  // update each participant data
  const participantsUpdatedSorted = participants
    .map((participant) => {
      // create a portfolio holding from transactions
      const portfolioStateHolding = getPortfolioStateHoldingsUtil(
        participant.transactions,
        symbolPriceQuoteFormat,
        [],
        simulator.cashStartingValue,
      );

      // convert to a  portfolio state
      const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHolding);

      // add additional cash to the portfolio
      portfolioState.cashOnHand += additionalCashOnRound;
      portfolioState.balance += additionalCashOnRound;

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

  // create a bulk writer
  const bulk = firestore().bulkWriter();

  // update aggregation data
  bulk.set(tradingSimulatorAggregationTransactionsDocRef(simulator.id), {
    bestTransactions: bestTransactions.docs.map((doc) => doc.data()),
    worstTransactions: worstTransactions.docs.map((doc) => doc.data()),
    lastTransactions: lastTransactions.docs.map((doc) => doc.data()),
  });

  // update simulator data
  bulk.update(tradingSimulatorDocRef(simulator.id), {
    // round to nearest because may be some time differences when this is updated and when CF runs to update it again
    nextRoundTime: roundToNearestMinutes(addMinutes(new Date(), simulator.oneRoundDurationMinutes), {
      // casting should be ok because it expects a {Unit extends number}
      nearestTo: 5,
      roundingMethod: 'floor', // round down
    }).toISOString(),
    currentRound: FieldValue.increment(1),
    // update the start date time if it is the first round
    startDateTime: isFistRound ? getCurrentDateIOSFormat() : simulator.startDateTime,
    // update the state if it is the first round
    state: isFistRound ? 'started' : simulator.state,
  } satisfies FieldValuePartial<TradingSimulator>);

  // update prices for each symbol
  bulk.update(tradingSimulatorAggregationSymbolsDocRef(simulator.id), symbolAggregationUpdate);

  // update each participant's data
  for (const participant of participantsUpdatedSorted) {
    bulk.update(tradingSimulatorParticipantsCollectionRef(simulator.id).doc(participant.userData.id), {
      portfolioState: participant.portfolioState,
      portfolioGrowth: FieldValue.arrayUnion(participant.portfolioGrowth.at(-1)),
      rank: participant.rank,
    } satisfies FieldValuePartial<TradingSimulatorParticipant>);
  }

  // recalculate user ranking
  bulk.set(tradingSimulatorAggregationParticipantsDocRef(simulator.id), {
    userRanking: participantsUpdatedSorted.map((participant) => ({
      userData: participant.userData,
      portfolioState: participant.portfolioState,
      rank: participant.rank,
    })),
  });

  // Listen for success and error events
  bulk.onWriteError((error) => {
    console.error('Error writing document: ', {
      cause: error.cause,
      code: error.code,
      message: error.message,
    });
    console.log('==================');
    return false;
  });

  // commit write operations
  await bulk.close();
};
