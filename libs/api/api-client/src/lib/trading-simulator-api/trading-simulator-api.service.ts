import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import {
  DataDocsWrapper,
  PortfolioTransaction,
  TradingSimulator,
  TradingSimulatorLatestData,
  TradingSimulatorOrder,
  TradingSimulatorParticipant,
  TradingSimulatorParticipatingUsers,
  TradingSimulatorSymbol,
  TradingSimulatorTransactionAggregation,
  TradingSimulatorUserRanking,
  UserBase,
  UserBaseMin,
} from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradingSimulatorApiService {
  private readonly firestore = inject(Firestore);

  readonly tradingSimulatorLatestData$ = rxDocData(this.getTradingSimulatorLatestDataDocRef()).pipe(
    map((data) => data ?? { live: [], open: [], historical: [] }),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  readonly tradingSimulatorLatestData = toSignal(this.tradingSimulatorLatestData$, {
    initialValue: { live: [], open: [], historical: [] },
  });

  getTradingSimulatorByOwner(ownerId: string): Observable<TradingSimulator[]> {
    return rxCollectionData(query(this.getTradingSimulatorCollection(), where('owner.id', '==', ownerId)));
  }

  getTradingSimulatorByParticipant(participantId: string): Observable<TradingSimulator[]> {
    return rxCollectionData(
      query(this.getTradingSimulatorCollection(), where('participants', 'array-contains', participantId)),
    );
  }

  getTradingSimulatorById(id: string): Observable<TradingSimulator | undefined> {
    return rxDocData(this.getTradingSimulatorDocRef(id));
  }

  addTradingSimulator(data: TradingSimulator): void {
    setDoc(this.getTradingSimulatorDocRef(data.id), data);
  }

  updateTradingSimulatorById(id: string, data: Partial<TradingSimulator>): void {
    setDoc(this.getTradingSimulatorDocRef(id), data, { merge: true });
  }

  getTradingSimulatorByIdSymbols(id: string): Observable<TradingSimulatorSymbol[]> {
    return rxCollectionData(this.getTradingSimulatorSymbolsCollection(id));
  }

  setTradingSimulatorByIdSymbol(id: string, data: TradingSimulatorSymbol): void {
    setDoc(this.getTradingSimulatorSymbolDocRef(id, data.symbol), data);
  }

  getTradingSimulatorByIdParticipantById(
    id: string,
    participantId: string,
  ): Observable<TradingSimulatorParticipant | undefined> {
    return rxDocData(this.getTradingSimulatorParticipantsDocRef(id, participantId));
  }

  updateTradingSimulatorByIdParticipantById(id: string, participant: TradingSimulatorParticipant): void {
    setDoc(this.getTradingSimulatorParticipantsDocRef(id, participant.userData.id), participant, { merge: true });
  }

  getTradingSimulatorByIdOpenOrders(id: string): Observable<TradingSimulatorOrder[]> {
    return rxCollectionData(query(this.getTradingSimulatorOrdersCollection(id), where('status', '==', 'open')));
  }

  addTradingSimulatorByIdOpenOrder(id: string, data: TradingSimulatorOrder): void {
    addDoc(this.getTradingSimulatorOrdersCollection(id), data);
  }

  addTradingSimulatorByIdTransaction(id: string, data: PortfolioTransaction): void {
    addDoc(this.getTradingSimulatorTransactionsCollection(id), data);
  }

  updateTradingSimulatorByIdOpenOrder(id: string, data: TradingSimulatorOrder): void {
    setDoc(this.getTradingSimulatorOrderDocRef(id, data.orderId), data, { merge: true });
  }

  getTradingSimulatorByIdTransactions(id: string): Observable<TradingSimulatorTransactionAggregation> {
    return rxDocData(this.getTradingSimulatorTransactions(id)).pipe(
      map((data) => data ?? { bestTransaction: [], worstTransaction: [], lastTransactions: [] }),
    );
  }

  getTradingSimulatorByIdUserRanking(id: string): Observable<TradingSimulatorUserRanking> {
    return rxDocData(this.getTradingSimulatorUserRanking(id)).pipe(
      map((data) => data ?? { data: [], lastModifiedDate: '' }),
    );
  }

  getTradingSimulatorByIdParticipatingUsers(id: string): Observable<TradingSimulatorParticipatingUsers> {
    return rxDocData(this.getTradingSimulatorParticipatingUsers(id)).pipe(
      map((data) => data ?? { data: [], lastModifiedDate: '' }),
    );
  }

  private getTradingSimulatorParticipatingUsers(id: string): DocumentReference<TradingSimulatorParticipatingUsers> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'participating_users').withConverter(
      assignTypesClient<DataDocsWrapper<UserBaseMin>>(),
    );
  }

  private getTradingSimulatorUserRanking(id: string): DocumentReference<TradingSimulatorUserRanking> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'user_ranking').withConverter(
      assignTypesClient<DataDocsWrapper<UserBase>>(),
    );
  }

  private getTradingSimulatorTransactions(id: string): DocumentReference<TradingSimulatorTransactionAggregation> {
    return doc(this.getTradingSimulatorMoreInformationCollection(id), 'transactions').withConverter(
      assignTypesClient<TradingSimulatorTransactionAggregation>(),
    );
  }

  private getTradingSimulatorOrderDocRef(id: string, orderId: string): DocumentReference<TradingSimulatorOrder> {
    return doc(this.getTradingSimulatorOrdersCollection(id), orderId);
  }

  private getTradingSimulatorOrdersCollection(id: string): CollectionReference<TradingSimulatorOrder, DocumentData> {
    return collection(this.getTradingSimulatorDocRef(id), 'orders').withConverter(
      assignTypesClient<TradingSimulatorOrder>(),
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

  private getTradingSimulatorMoreInformationCollection(id: string): CollectionReference<DocumentData, DocumentData> {
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
