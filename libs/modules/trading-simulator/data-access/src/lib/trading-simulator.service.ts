import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { AggregationApiService, TradingSimulatorApiService } from '@mm/api-client';
import {
  DATA_NOT_FOUND_ERROR,
  FieldValuePartial,
  PortfolioTransaction,
  SIMULATOR_NOT_ENOUGH_UNITS_TO_SELL,
  TRADING_SIMULATOR_PARTICIPANTS_LIMIT,
  TradingSimulator,
  TradingSimulatorLatestData,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { firstValueFrom, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorService {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly aggregationApiService = inject(AggregationApiService);

  readonly tradingSimulatorLatestData = toSignal(
    this.aggregationApiService
      .getTradingSimulatorLatestData()
      .pipe(map((data) => data ?? ({ live: [], started: [], historical: [] } satisfies TradingSimulatorLatestData))),
    {
      initialValue: { live: [], started: [], historical: [] },
    },
  );

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

  getTradingSimulatorByIdTransactions(simulatorId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorByIdTransactions(simulatorId);
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
    return this.tradingSimulatorApiService.upsertTradingSimulator(data);
  }

  simulatorStateChangeGoLive(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserBaseMin();

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can change the state of the simulator');
    }

    // change state to live
    this.tradingSimulatorApiService.updateTradingSimulator(simulator.id, { state: 'live' });

    // add simulator to the aggregation list
    this.aggregationApiService.updateTradingSimulatorLatestData({
      live: arrayUnion(simulator),
    } satisfies FieldValuePartial<TradingSimulatorLatestData>);
  }

  simulatorStateChangeDraft(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserBaseMin();

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

    // remove simulator from the aggregation list
    this.aggregationApiService.updateTradingSimulatorLatestData({
      live: this.tradingSimulatorLatestData().live.filter((d) => d.id !== simulator.id),
    } satisfies Partial<TradingSimulatorLatestData>);
  }

  simulatorStateChangeStart(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserBaseMin();

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
    this.tradingSimulatorApiService.updateTradingSimulator(simulator.id, { state: 'started' });

    // add simulator to the aggregation list
    this.aggregationApiService.updateTradingSimulatorLatestData({
      live: arrayRemove(simulator),
      started: arrayUnion(simulator),
    } satisfies FieldValuePartial<TradingSimulatorLatestData>);
  }

  joinSimulator(simulator: TradingSimulator, invitationCode: string) {
    const userBase = this.authenticationUserStoreService.state.getUserBaseMin();

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

    // add user to participants
    this.tradingSimulatorApiService.joinSimulator(simulator, userBase);
  }

  leaveSimulator(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserBaseMin();

    // check if user is a participant
    if (!simulator.participants.includes(userBase.id)) {
      return;
    }

    // remove user from participants
    this.tradingSimulatorApiService.leaveSimulator(simulator, userBase);
  }

  deleteSimulator(simulator: TradingSimulator) {
    const userBase = this.authenticationUserStoreService.state.getUserBaseMin();

    // check if user is the owner
    if (simulator.owner.id !== userBase.id) {
      throw new Error('Only the owner can delete the simulator');
    }

    // check if simulator is in draft state
    if (simulator.state !== 'draft') {
      throw new Error('Simulator must be in draft state');
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
