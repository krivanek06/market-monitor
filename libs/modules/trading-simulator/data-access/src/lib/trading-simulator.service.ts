import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TradingSimulatorApiService } from '@mm/api-client';
import { OutstandingOrder, TradingSimulator, TradingSimulatorSymbol } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { getCurrentDateDetailsFormat } from '@mm/shared/general-util';
import { Observable, of } from 'rxjs';

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

  readonly simulatorByParticipant = toSignal(
    this.tradingSimulatorApiService.getTradingSimulatorByParticipant(
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

  getTradingSimulatorAggregationParticipants(simulatorId: string) {
    return this.tradingSimulatorApiService.getTradingSimulatorAggregationParticipants(simulatorId);
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
      currentRound: 1,
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
      currentRound: simulator.maximumRounds,
    });
  }

  joinSimulator(simulator: TradingSimulator, invitationCode: string) {
    return this.tradingSimulatorApiService.simulatorCreateAction({
      type: 'participantJoinSimulator',
      simulatorId: simulator.id,
      invitationCode,
    });
  }

  leaveSimulator(simulator: TradingSimulator) {
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

  incrementToNextRound(simulator: TradingSimulator) {
    return this.tradingSimulatorApiService.simulatorCreateAction({
      type: 'nextRound',
      simulatorId: simulator.id,
    });
  }

  createOutstandingOrder(simulator: TradingSimulator, order: OutstandingOrder) {
    return this.tradingSimulatorApiService.simulatorCreateAction({
      type: 'createOutstandingOrder',
      simulatorId: simulator.id,
      order,
    });
  }
}
