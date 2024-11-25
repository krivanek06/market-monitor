import { inject, Injectable } from '@angular/core';
import {
  arrayUnion,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDocs,
  increment,
  limit,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import {
  FieldValuePartial,
  PortfolioTransaction,
  TradingSimulator,
  TradingSimulatorAggregationParticipants,
  TradingSimulatorAggregationParticipantsData,
  TradingSimulatorAggregationSymbols,
  TradingSimulatorAggregationTransactions,
  TradingSimulatorGeneralActions,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { roundNDigits } from '@mm/shared/general-util';
import { httpsCallable } from 'firebase/functions';
import { filterNil } from 'ngxtension/filter-nil';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { combineLatest, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorApiService {
  private readonly firestore = inject(Firestore);
  private readonly functions = inject(Functions);

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
  getTradingSimulatorAggregationParticipants(id: string): Observable<TradingSimulatorAggregationParticipantsData[]> {
    return rxDocData(this.getTradingSimulatorAggregationParticipantsDocRef(id)).pipe(map((d) => d?.userRanking ?? []));
  }

  getTradingSimulatorByIdParticipantById(
    id: string,
    participantId: string,
  ): Observable<TradingSimulatorParticipant | undefined> {
    return rxDocData(this.getTradingSimulatorParticipantsDocRef(id, participantId));
  }

  getTradingSimulatorAggregationSymbols(id: string): Observable<TradingSimulatorAggregationSymbols> {
    return rxDocData(this.getTradingSimulatorAggregationSymbolsDocRef(id)).pipe(filterNil());
  }

  getTradingSimulatorAggregationTransactions(id: string): Observable<TradingSimulatorAggregationTransactions> {
    return rxDocData(this.getTradingSimulatorAggregationTransactionsDocRef(id)).pipe(filterNil());
  }

  getTradingSimulatorLatestData() {
    const liveSimulator$ = rxCollectionData(query(this.getTradingSimulatorCollection(), where('state', '==', 'live')));
    const startedSimulator$ = rxCollectionData(
      query(this.getTradingSimulatorCollection(), where('state', '==', 'started')),
    );
    const historicalSimulator$ = rxCollectionData(
      query(this.getTradingSimulatorCollection(), where('state', '==', 'finished'), limit(5)),
    );

    return combineLatest([liveSimulator$, startedSimulator$, historicalSimulator$]).pipe(
      map(([live, started, historical]) => ({
        live,
        started,
        historical,
      })),
    );
  }

  updateTradingSimulator(id: string, data: Partial<TradingSimulator>): void {
    updateDoc(this.getTradingSimulatorDocRef(id), data);
  }

  async upsertTradingSimulator(data: {
    tradingSimulator: TradingSimulator;
    tradingSimulatorSymbol: TradingSimulatorSymbol[];
  }): Promise<void> {
    const batch = writeBatch(this.firestore);

    // save trading simulator document
    batch.set(this.getTradingSimulatorDocRef(data.tradingSimulator.id), data.tradingSimulator);

    // get all existing symbols
    const snapshot = await getDocs(this.getTradingSimulatorSymbolsCollection(data.tradingSimulator.id));

    // queue deletions of previous symbols
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // add new symbols to the batch
    data.tradingSimulatorSymbol.forEach((symbol) => {
      batch.set(this.getTradingSimulatorSymbolDocRef(data.tradingSimulator.id, symbol.symbol), symbol);
    });

    // create aggregation document for symbols
    const aggregationData = data.tradingSimulatorSymbol.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.symbol]: {
          buyOperations: 0,
          boughtUnits: 0,
          investedTotal: 0,
          sellOperations: 0,
          soldUnits: 0,
          soldTotal: 0,
          currentPrice: curr.historicalDataModified.at(0) ?? 0,
          unitsCurrentlyAvailable: curr.unitsAvailableOnStart,
          unitsInfinity: curr.unitsInfinity,
          symbol: curr.symbol,
          unitsTotalAvailable: curr.unitsAvailableOnStart,
        },
      }),
      {} as TradingSimulatorAggregationSymbols,
    );

    batch.set(this.getTradingSimulatorAggregationSymbolsDocRef(data.tradingSimulator.id), aggregationData);

    // create aggregation document for transactions
    batch.set(this.getTradingSimulatorAggregationTransactionsDocRef(data.tradingSimulator.id), {
      bestTransactions: [],
      lastTransactions: [],
      worstTransactions: [],
    });

    // commit the batch
    await batch.commit();
  }

  simulatorCreateAction(data: TradingSimulatorGeneralActions) {
    const callable = httpsCallable<TradingSimulatorGeneralActions, void>(this.functions, 'tradingSimulatorActionCall');
    return callable(data);
  }

  async deleteSimulator(simulator: TradingSimulator) {
    const batch = writeBatch(this.firestore);

    // remove all participants
    for (const participant of simulator.participants) {
      batch.delete(this.getTradingSimulatorParticipantsDocRef(simulator.id, participant));
    }

    // remove all symbols
    const symbolsData = await getDocs(this.getTradingSimulatorSymbolsCollection(simulator.id));
    symbolsData.docs.forEach((doc) => batch.delete(doc.ref));

    // remove all transactions
    const transactionData = await getDocs(this.getTradingSimulatorTransactionsCollection(simulator.id));
    transactionData.docs.forEach((doc) => batch.delete(doc.ref));

    // remove symbol aggregation
    batch.delete(this.getTradingSimulatorAggregationSymbolsDocRef(simulator.id));

    // remove additional aggregation data
    batch.delete(this.getTradingSimulatorAggregationTransactionsDocRef(simulator.id));

    // remove additional participant aggregation data
    batch.delete(this.getTradingSimulatorAggregationParticipantsDocRef(simulator.id));

    // remove simulator document
    batch.delete(this.getTradingSimulatorDocRef(simulator.id));

    // commit the batch
    await batch.commit();
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
    const batch = writeBatch(this.firestore);

    // add transaction to the participant data
    batch.update(this.getTradingSimulatorParticipantsDocRef(simulator.id, participant.userData.id), {
      transactions: arrayUnion(transaction),
      // todo - update portfolio state
      // todo - update holdings
    });

    // add transaction to the transaction collection
    batch.set(doc(this.getTradingSimulatorTransactionsCollection(simulator.id)), transaction);

    // update symbol data
    const isSell = transaction.transactionType === 'SELL';
    batch.update(this.getTradingSimulatorAggregationSymbolsDocRef(simulator.id), {
      [transaction.symbol]: {
        boughtUnits: increment(isSell ? 0 : transaction.units),
        soldUnits: increment(isSell ? transaction.units : 0),
        investedTotal: increment(isSell ? 0 : roundNDigits(transaction.units * transaction.unitPrice)),
        buyOperations: increment(isSell ? 0 : 1),
        sellOperations: increment(isSell ? 1 : 0),
        soldTotal: increment(roundNDigits(transaction.returnValue)),
        unitsCurrentlyAvailable: increment(isSell ? transaction.units : -transaction.units),
      } satisfies FieldValuePartial<TradingSimulatorAggregationSymbols[0]>,
    });
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

  private getTradingSimulatorAggregationTransactionsDocRef(
    id: string,
  ): DocumentReference<TradingSimulatorAggregationTransactions> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'aggregation_transactions').withConverter(
      assignTypesClient<TradingSimulatorAggregationTransactions>(),
    );
  }

  private getTradingSimulatorAggregationParticipantsDocRef(
    id: string,
  ): DocumentReference<TradingSimulatorAggregationParticipants> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'aggregation_participants').withConverter(
      assignTypesClient<TradingSimulatorAggregationParticipants>(),
    );
  }

  private getTradingSimulatorAggregationSymbolsDocRef(
    id: string,
  ): DocumentReference<TradingSimulatorAggregationSymbols> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'aggregation_symbols').withConverter(
      assignTypesClient<TradingSimulatorAggregationSymbols>(),
    );
  }

  private getTradingSimulatorMoreInformationCollection(id: string): CollectionReference<DocumentData> {
    return collection(this.getTradingSimulatorDocRef(id), 'more_information');
  }

  private getTradingSimulatorDocRef(id: string): DocumentReference<TradingSimulator> {
    return doc(this.getTradingSimulatorCollection(), id);
  }

  private getTradingSimulatorCollection(): CollectionReference<TradingSimulator, DocumentData> {
    return collection(this.firestore, 'trading_simulator').withConverter(assignTypesClient<TradingSimulator>());
  }
}
