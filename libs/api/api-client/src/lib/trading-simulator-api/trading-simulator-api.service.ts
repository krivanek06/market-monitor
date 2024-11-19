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
import { Functions, httpsCallable } from '@angular/fire/functions';
import {
  PortfolioTransaction,
  TradingSimulator,
  TradingSimulatorGeneralActions,
  TradingSimulatorLatestData,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  TradingSimulatorTransactionAggregation,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorApiService {
  private readonly firestore = inject(Firestore);
  private readonly functions = inject(Functions);

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
  }

  addTradingSimulatorByIdTransaction(id: string, data: PortfolioTransaction): void {
    // add transaction to transaction collection
    addDoc(this.getTradingSimulatorTransactionsCollection(id), data);

    // add transaction to the participant data
    updateDoc(this.getTradingSimulatorParticipantsDocRef(id, data.userId), {
      transactions: arrayUnion(data),
    });
  }

  async tradingSimulatorAction(data: TradingSimulatorGeneralActions): Promise<void> {
    const callable = httpsCallable<TradingSimulatorGeneralActions, void>(
      this.functions,
      'tradingSimulatorGeneralActionsCall',
    );
    const res = await callable(data);
    return res.data;
  }

  getTradingSimulatorByIdTransactionAggregation(id: string): Observable<TradingSimulatorTransactionAggregation> {
    const latestTransactions = rxCollectionData(
      query(this.getTradingSimulatorTransactionsCollection(id), orderBy('dateExecuted', 'desc'), limit(25)),
    );

    const bestTransaction = rxCollectionData(
      query(
        this.getTradingSimulatorTransactionsCollection(id),
        where('transactionType', '==', 'SELL'),
        orderBy('returnChange', 'desc'),
        limit(10),
      ),
    );

    const worstTransaction = rxCollectionData(
      query(
        this.getTradingSimulatorTransactionsCollection(id),
        where('transactionType', '==', 'SELL'),
        orderBy('returnChange', 'desc'),
        limit(10),
      ),
    );

    return combineLatest([latestTransactions, bestTransaction, worstTransaction]).pipe(
      map(([lastTransactions, bestTransaction, worstTransaction]) => {
        return {
          bestTransaction,
          worstTransaction,
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
