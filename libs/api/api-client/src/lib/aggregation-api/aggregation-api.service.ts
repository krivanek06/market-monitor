import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  collection,
  doc,
} from '@angular/fire/firestore';
import { HallOfFameGroups, HallOfFameUsers } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { docData as rxDocData } from 'rxfire/firestore';
import { map, shareReplay } from 'rxjs';

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

  private getAggregationCollectionRef(): CollectionReference<unknown, DocumentData> {
    return collection(this.firestore, 'aggregations');
  }
}
