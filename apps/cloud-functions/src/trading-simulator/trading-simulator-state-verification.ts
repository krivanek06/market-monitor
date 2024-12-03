import { tradingSimulatorCollectionRef } from '../database';
import { tradingSimulatorOnNextRound } from './trading-simulator-next-round';

/**
 * - load all started simulators and check if the next round should be incremented
 * - load live simulators and check if the start date is reached
 */
export const tradingSimulatorStateVerification = async () => {
  // load all started simulators
  const simulatorsStarted = await tradingSimulatorCollectionRef()
    .where('state', '==', 'started')
    .where('nextRoundTime', '<=', new Date().toISOString())
    .get();

  // simulators that should start
  const simulatorsShouldStart = await tradingSimulatorCollectionRef()
    .where('state', '==', 'live')
    .where('startDateTime', '<=', new Date().toISOString())
    .get();

  // increment the round
  for (const doc of simulatorsStarted.docs) {
    tradingSimulatorOnNextRound(doc.data());
  }

  // start the simulator
  for (const doc of simulatorsShouldStart.docs) {
    tradingSimulatorOnNextRound(doc.data());
  }
};
