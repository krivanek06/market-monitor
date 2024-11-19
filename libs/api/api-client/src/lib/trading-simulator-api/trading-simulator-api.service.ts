import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  addDoc,
  arrayUnion,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  DATA_NOT_FOUND_ERROR,
  PortfolioTransaction,
  SIMULATOR_NOT_ENOUGH_UNITS_TO_SELL,
  TradingSimulator,
  TradingSimulatorAggregations,
  TradingSimulatorLatestData,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserBaseMin,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { createEmptyPortfolioState, roundNDigits } from '@mm/shared/general-util';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { combineLatest, firstValueFrom, map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorApiService {
  private readonly firestore = inject(Firestore);

  readonly tradingSimulatorLatestData = toSignal(
    rxDocData(this.getTradingSimulatorLatestDataDocRef()).pipe(
      map((data) => data ?? { live: [], open: [], historical: [] }),
      shareReplay({ refCount: false, bufferSize: 1 }),
    ),
    {
      initialValue: { live: [], open: [], historical: [] },
    },
  );

  /**
   *
   * @param ownerId - the id of the owner
   * @returns all trading simulators where the user is the owner
   */
  getTradingSimulatorByOwner(ownerId?: string): Observable<TradingSimulator[]> {
    return rxCollectionData(query(this.getTradingSimulatorCollection(), where('owner.id', '==', ownerId)));
  }

  /**
   *
   * @param participantId - the id of the participant
   * @returns all trading simulators where the user is a participant
   */
  getTradingSimulatorByParticipant(participantId?: string): Observable<TradingSimulator[]> {
    return rxCollectionData(
      query(this.getTradingSimulatorCollection(), where('participants', 'array-contains', participantId)),
    );
  }

  getTradingSimulatorById(id: string): Observable<TradingSimulator | undefined> {
    return rxDocData(this.getTradingSimulatorDocRef(id));
  }

  getTradingSimulatorByIdSymbols(id: string): Observable<TradingSimulatorSymbol[]> {
    return rxCollectionData(this.getTradingSimulatorSymbolsCollection(id));
  }

  /**
   *
   * @param id - the id of the trading simulator
   * @returns top 15 participants by balance
   */
  getTradingSimulatorByIdTopParticipants(id: string): Observable<TradingSimulatorParticipant[]> {
    return rxCollectionData(
      query(this.getTradingSimulatorParticipantsCollection(id), orderBy('portfolioState.balance', 'desc'), limit(15)),
    );
  }

  getTradingSimulatorByIdParticipantById(
    id: string,
    participantId: string,
  ): Observable<TradingSimulatorParticipant | undefined> {
    return rxDocData(this.getTradingSimulatorParticipantsDocRef(id, participantId));
  }

  async upsertTradingSimulator(data: {
    tradingSimulator: TradingSimulator;
    tradingSimulatorSymbol: TradingSimulatorSymbol[];
  }): Promise<void> {
    // save trading simulator
    setDoc(this.getTradingSimulatorDocRef(data.tradingSimulator.id), data.tradingSimulator);

    // get all symbols
    const snapshot = await getDocs(this.getTradingSimulatorSymbolsCollection(data.tradingSimulator.id));

    // remove previous symbols
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // save trading simulator symbols
    data.tradingSimulatorSymbol.forEach((symbol) => {
      setDoc(this.getTradingSimulatorSymbolDocRef(data.tradingSimulator.id, symbol.symbol), symbol);
    });

    // create aggregation document
    setDoc(this.getTradingSimulatorAggregationDocRef(data.tradingSimulator.id), {
      bestTransactions: [],
      worstTransactions: [],
      lastTransactions: [],
      symbolAggregations: data.tradingSimulatorSymbol.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.symbol]: {
            buyOperations: 0,
            boughtUnits: 0,
            investedTotal: 0,
            sellOperations: 0,
            soldUnits: 0,
            soldTotal: 0,
            unitsCurrentlyAvailable: curr.unitsAvailableOnStart,
            unitsInfinity: curr.unitsInfinity,
          } satisfies TradingSimulatorAggregations['symbolAggregations'][0],
        }),
        {} satisfies TradingSimulatorAggregations['symbolAggregations'],
      ),
    });
  }

  joinSimulator(simulator: TradingSimulator, user: UserBaseMin, invitationCode: string) {
    // check if user is already a participant
    if (simulator.participants.includes(user.id)) {
      return;
    }

    // check if provided invitation code is correct
    if (simulator.invitationCode !== invitationCode) {
      throw new Error('Invalid invitation code');
    }

    // add user to the participants
    updateDoc(this.getTradingSimulatorDocRef(simulator.id), {
      participants: arrayUnion(user.id),
    });

    // add user to the participant data
    setDoc(this.getTradingSimulatorParticipantsDocRef(simulator.id, user.id), {
      userData: user,
      portfolioState: createEmptyPortfolioState(simulator.cashStartingValue),
      holdings: [],
      transactions: [],
      portfolioGrowth: [],
    });
  }

  leaveSimulator(simulator: TradingSimulator, user: UserBaseMin) {
    // remove user from the participants
    updateDoc(this.getTradingSimulatorDocRef(simulator.id), {
      participants: simulator.participants.filter((participant) => participant !== user.id),
    });

    // remove user from the participant data
    deleteDoc(this.getTradingSimulatorParticipantsDocRef(simulator.id, user.id));
  }

  /**
   *
   * @param simulator - the trading simulator
   * @param participant - the participating user who makes a transaction
   * @param transaction - the transaction to add to the simulator
   */
  async addTransaction(
    simulator: TradingSimulator,
    participant: TradingSimulatorParticipant,
    transaction: PortfolioTransaction,
  ) {
    const aggregation = await firstValueFrom(rxDocData(this.getTradingSimulatorAggregationDocRef(simulator.id)));
    const symbolData = aggregation?.symbolAggregations[transaction.symbol];

    // check if symbol exists
    if (!symbolData || !aggregation) {
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
    // add transaction to the participant data
    updateDoc(this.getTradingSimulatorParticipantsDocRef(simulator.id, participant.userData.id), {
      transactions: arrayUnion(transaction),
    });

    // add transaction to the transaction collection
    addDoc(this.getTradingSimulatorTransactionsCollection(simulator.id), transaction);

    // update aggregation
    const isSell = transaction.transactionType === 'SELL';
    updateDoc(this.getTradingSimulatorAggregationDocRef(simulator.id), {
      symbolAggregations: {
        ...aggregation.symbolAggregations,
        [transaction.symbol]: {
          ...symbolData,
          boughtUnits: isSell ? symbolData.boughtUnits : symbolData.boughtUnits + transaction.units,
          soldUnits: isSell ? symbolData.soldUnits + transaction.units : symbolData.soldUnits,
          investedTotal: isSell
            ? symbolData.investedTotal
            : roundNDigits(symbolData.investedTotal + transaction.units * transaction.unitPrice),
          buyOperations: isSell ? symbolData.buyOperations : symbolData.buyOperations + 1,
          sellOperations: isSell ? symbolData.sellOperations + 1 : symbolData.sellOperations,
          soldTotal: roundNDigits(symbolData.soldTotal + transaction.returnValue),
          unitsCurrentlyAvailable:
            symbolData.unitsCurrentlyAvailable + (isSell ? transaction.units : -transaction.units),
        } satisfies TradingSimulatorAggregations['symbolAggregations'][0],
      },
    });
  }

  getTradingSimulatorByIdTransactions(id: string): Observable<{
    bestTransactions: PortfolioTransaction[];
    worstTransactions: PortfolioTransaction[];
    lastTransactions: PortfolioTransaction[];
  }> {
    const latestTransactions$ = rxCollectionData(
      query(this.getTradingSimulatorTransactionsCollection(id), orderBy('date', 'desc'), limit(25)),
    );

    const bestTransactions$ = rxCollectionData(
      query(
        this.getTradingSimulatorTransactionsCollection(id),
        where('transactionType', '==', 'SELL'),
        orderBy('returnChange', 'desc'),
        limit(10),
      ),
    );

    const worstTransactions$ = rxCollectionData(
      query(
        this.getTradingSimulatorTransactionsCollection(id),
        where('transactionType', '==', 'SELL'),
        orderBy('returnChange', 'desc'),
        limit(10),
      ),
    );

    return combineLatest([latestTransactions$, bestTransactions$, worstTransactions$]).pipe(
      map(([lastTransactions, bestTransactions, worstTransactions]) => {
        return {
          bestTransactions,
          worstTransactions,
          lastTransactions,
        };
      }),
    );
  }

  private getTradingSimulatorParticipantsDocRef(
    id: string,
    participantId: string,
  ): DocumentReference<TradingSimulatorParticipant> {
    return doc(this.getTradingSimulatorParticipantsCollection(id), participantId);
  }

  private getTradingSimulatorParticipantsCollection(
    id: string,
  ): CollectionReference<TradingSimulatorParticipant, DocumentData> {
    return collection(this.getTradingSimulatorDocRef(id), 'participants').withConverter(
      assignTypesClient<TradingSimulatorParticipant>(),
    );
  }

  private getTradingSimulatorSymbolDocRef(id: string, symbol: string): DocumentReference<TradingSimulatorSymbol> {
    return doc(this.getTradingSimulatorSymbolsCollection(id), symbol);
  }

  private getTradingSimulatorSymbolsCollection(id: string): CollectionReference<TradingSimulatorSymbol, DocumentData> {
    return collection(this.getTradingSimulatorDocRef(id), 'symbols').withConverter(
      assignTypesClient<TradingSimulatorSymbol>(),
    );
  }

  private getTradingSimulatorTransactionsCollection(
    id: string,
  ): CollectionReference<PortfolioTransaction, DocumentData> {
    return collection(this.getTradingSimulatorDocRef(id), 'transactions').withConverter(
      assignTypesClient<PortfolioTransaction>(),
    );
  }

  private getTradingSimulatorAggregationDocRef(id: string): DocumentReference<TradingSimulatorAggregations> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'aggregations').withConverter(
      assignTypesClient<TradingSimulatorAggregations>(),
    );
  }

  private getTradingSimulatorMoreInformationCollection(id: string): CollectionReference<DocumentData> {
    return collection(this.getTradingSimulatorDocRef(id), 'more_information');
  }

  private getTradingSimulatorDocRef(id: string): DocumentReference<TradingSimulator> {
    return doc(this.getTradingSimulatorCollection(), id);
  }

  private getTradingSimulatorLatestDataDocRef(): DocumentReference<TradingSimulatorLatestData> {
    return doc(collection(this.firestore, 'aggregations'), 'trading_simulator_latest_data').withConverter(
      assignTypesClient<TradingSimulatorLatestData>(),
    );
  }

  private getTradingSimulatorCollection(): CollectionReference<TradingSimulator, DocumentData> {
    return collection(this.firestore, 'trading_simulator').withConverter(assignTypesClient<TradingSimulator>());
  }
}
