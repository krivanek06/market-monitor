import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  collection,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { HallOfFameGroups, HallOfFameUsers, TradingSimulatorLatestData } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AggregationApiService {
  private readonly firestore = inject(Firestore);
  private readonly defaultValue = {
    date: '',
    bestPortfolio: [],
    bestDailyGains: [],
    worstDailyGains: [],
  } satisfies HallOfFameUsers;

  readonly hallOfFameUsers$ = rxDocData(this.getHallOfFameUsersDocRef()).pipe(
    map((data) => data ?? this.defaultValue),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  readonly hallOfFameGroups$ = rxDocData(this.getHallOfFameGroupsDocRef()).pipe(
    map((data) => data ?? this.defaultValue),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  readonly hallOfFameUsers = toSignal(this.hallOfFameUsers$, {
    initialValue: this.defaultValue,
  });

  readonly hallOfFameGroups = toSignal(this.hallOfFameGroups$, {
    initialValue: this.defaultValue,
  });

  getTradingSimulatorLatestData(): Observable<TradingSimulatorLatestData> {
    return rxDocData(this.getTradingSimulatorLatestDataDocRef()).pipe(
      map((data) => data ?? { live: [], started: [], historical: [] }),
    );
  }

  updateTradingSimulatorLatestData(data: Partial<TradingSimulatorLatestData> | DocumentData) {
    updateDoc(this.getTradingSimulatorLatestDataDocRef(), {
      ...data,
    });
  }

  private getHallOfFameGroupsDocRef(): DocumentReference<HallOfFameGroups> {
    return doc(this.getAggregationCollectionRef(), 'hall_of_fame_groups').withConverter(
      assignTypesClient<HallOfFameGroups>(),
    );
  }

  private getHallOfFameUsersDocRef(): DocumentReference<HallOfFameUsers> {
    return doc(this.getAggregationCollectionRef(), 'hall_of_fame_users').withConverter(
      assignTypesClient<HallOfFameUsers>(),
    );
  }

  private getTradingSimulatorLatestDataDocRef(): DocumentReference<TradingSimulatorLatestData> {
    return doc(this.getAggregationCollectionRef(), 'trading_simulator_latest_data').withConverter(
      assignTypesClient<TradingSimulatorLatestData>(),
    );
  }

  private getAggregationCollectionRef(): CollectionReference<unknown, DocumentData> {
    return collection(this.firestore, 'aggregations');
  }
}
