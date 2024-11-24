import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TradingSimulatorApiService } from '@mm/api-client';
import {
  DATA_NOT_FOUND_ERROR,
  PortfolioTransaction,
  SIMULATOR_NOT_ENOUGH_UNITS_TO_SELL,
  TRADING_SIMULATOR_PARTICIPANTS_LIMIT,
  TradingSimulator,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { getCurrentDateDetailsFormat } from '@mm/shared/general-util';
import { firstValueFrom, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);

  readonly tradingSimulatorLatestData = toSignal(this.tradingSimulatorApiService.getTradingSimulatorLatestData(), {
    initialValue: { live: [], started: [], historical: [] },
  });

  readonly simulatorsByOwner = toSignal(
    this.tradingSimulatorApiService.getTradingSimulatorByOwner(
      this.authenticationUserStoreService.state.getUserData().id,
    ),
  );

  getTradingSimulatorById(simulatorId: string): Observable<TradingSimulator | undefined> {
    if (!simulatorId) {
      return of(undefined);
    }

    return this.tradingSimulatorApiService.getTradingSimulatorById(simulatorId);
  }

  getTradingSimulatorByIdSymbols(simulatorId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorByIdSymbols(simulatorId);
  }

  getTradingSimulatorAggregationSymbols(simulatorId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorAggregationSymbols(simulatorId);
  }

  getTradingSimulatorAggregationTransactions(simulatorId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorAggregationTransactions(simulatorId);
  }

  getTradingSimulatorByIdTopParticipants(simulatorId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorByIdTopParticipants(simulatorId);
  }

  getTradingSimulatorByIdParticipantById(simulatorId: string, participantId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorByIdParticipantById(simulatorId, participantId);
  }

  upsertTradingSimulator(data: {
    tradingSimulator: TradingSimulator;
    tradingSimulatorSymbol: TradingSimulatorSymbol[];
  }) {
    const userData = this.authenticationUserStoreService.state.getUserData();

    // check if user has privileges
    if (!userData.featureAccess?.createTradingSimulator) {
      throw new Error('User does not have privileges to create a simulator');
    }

    // check if user is the owner
    if (data.tradingSimulator.owner.id !== userData.id) {
      throw new Error('Only the owner can update the simulator');
    }

    return this.tradingSimulatorApiService.upsertTradingSimulator(data);
  }

  simulatorStateChangeGoLive(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can change the state of the simulator');
    }

    // change state to live
    this.tradingSimulatorApiService.updateTradingSimulator(simulator.id, { state: 'live' });
  }

  simulatorStateChangeDraft(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can change the state of the simulator');
    }

    // check if simulator is in live state
    if (simulator.state !== 'live') {
      throw new Error('Simulator must be in live state');
    }

    // change state to draft
    this.tradingSimulatorApiService.updateTradingSimulator(simulator.id, { state: 'draft' });
  }

  simulatorStateChangeStart(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if simulator already started
    if (simulator.state === 'started') {
      throw new Error('Simulator already started');
    }

    // check if simulator is live
    if (simulator.state !== 'live') {
      throw new Error('Simulator is not live');
    }

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can start the simulator');
    }

    // change state to started
    this.tradingSimulatorApiService.updateTradingSimulator(simulator.id, {
      state: 'started',
      startDateTime: getCurrentDateDetailsFormat(),
    });
  }

  simulatorStateChangeFinish(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can delete the simulator');
    }

    // check if simulator is in started state
    if (simulator.state !== 'started') {
      throw new Error('Simulator must be in draft state');
    }

    // change state to started
    this.tradingSimulatorApiService.updateTradingSimulator(simulator.id, {
      state: 'finished',
      endDateTime: getCurrentDateDetailsFormat(),
    });
  }

  joinSimulator(simulator: TradingSimulator, invitationCode: string) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if user is already a participant
    if (simulator.participants.includes(userBase.id)) {
      throw new Error('User is already a participant');
    }

    // check if there is space to join
    if (simulator.currentParticipants >= TRADING_SIMULATOR_PARTICIPANTS_LIMIT) {
      throw new Error('Simulator is full');
    }

    // check if provided invitation code is correct
    if (simulator.invitationCode !== invitationCode) {
      throw new Error('Invalid invitation code');
    }

    // join simulator
    return this.tradingSimulatorApiService.simulatorCreateAction({
      type: 'participantJoinSimulator',
      simulatorId: simulator.id,
      invitationCode,
    });
  }

  leaveSimulator(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if user is a participant
    if (!simulator.participants.includes(userBase.id)) {
      return;
    }

    // remove user from participants
    return this.tradingSimulatorApiService.simulatorCreateAction({
      type: 'participantLeaveSimulator',
      simulatorId: simulator.id,
    });
  }

  deleteSimulator(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserDataMin();

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can delete the simulator');
    }

    // check if simulator is in draft state or finished
    if (simulator.state !== 'draft' && simulator.state !== 'finished') {
      throw new Error('Simulator must be in draft or finished state');
    }

    // remove simulator
    return this.tradingSimulatorApiService.deleteSimulator(simulator);
  }

  async addTransaction(
    simulator: TradingSimulator,
    participant: TradingSimulatorParticipant,
    transaction: PortfolioTransaction,
  ) {
    const symbolAggregation = await firstValueFrom(
      this.tradingSimulatorApiService.getTradingSimulatorAggregationSymbols(simulator.id),
    );
    const symbolData = symbolAggregation[transaction.symbol];

    // check if symbol exists
    if (!symbolData) {
      throw new Error(DATA_NOT_FOUND_ERROR);
    }

    // BUY order
    if (transaction.transactionType === 'BUY') {
      const totalValue = transaction.units * transaction.unitPrice + transaction.transactionFees;

      // check if user has enough cash on hand if BUY and cashAccountActive
      if (participant.portfolioState.cashOnHand < totalValue) {
        throw new Error(USER_NOT_ENOUGH_CASH_ERROR);
      }

      // check if there is enough units to buy
      if (symbolData.unitsCurrentlyAvailable < transaction.units) {
        throw new Error(SIMULATOR_NOT_ENOUGH_UNITS_TO_SELL);
      }
    }

    // SELL order
    else if (transaction.transactionType === 'SELL') {
      // check if user has any holdings of that symbol
      const symbolHoldings = participant.holdings.find((d) => d.symbol === transaction.symbol);

      // check if user has enough units on hand if SELL
      if ((symbolHoldings?.units ?? -1) < transaction.units) {
        throw new Error(USER_NOT_UNITS_ON_HAND_ERROR);
      }
    }

    // save transaction
    this.tradingSimulatorApiService.addTransaction(simulator, participant, transaction);
  }
}
