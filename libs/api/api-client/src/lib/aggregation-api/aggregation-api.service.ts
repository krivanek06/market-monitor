import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollectionReference, DocumentData, DocumentReference, Firestore, collection } from '@angular/fire/firestore';
import { HallOfFameGroups, HallOfFameUsers } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { doc } from 'firebase/firestore';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AggregationApiService {
  private firestore = inject(Firestore);
  private defaultValue = {
    date: '',
    bestPortfolio: [],
    bestDailyGains: [],
    worstDailyGains: [],
  } satisfies HallOfFameUsers;

  hallOfFameUsers = toSignal(this.getHallOfFameUsers(), {
    initialValue: this.defaultValue,
  });

  hallOfFameGroups = toSignal(this.getHallOfFameGroups(), {
    initialValue: this.defaultValue,
  });

  private getHallOfFameUsers(): Observable<HallOfFameUsers> {
    // cache the data
    return rxDocData(this.getHallOfFameUsersDocRef()).pipe(
      map((data) => data ?? this.defaultValue),
      shareReplay({ refCount: false, bufferSize: 1 }),
    );
  }

  private getHallOfFameGroups(): Observable<HallOfFameGroups> {
    // cache the data
    return rxDocData(this.getHallOfFameGroupsDocRef()).pipe(
      map((data) => data ?? this.defaultValue),
      shareReplay({ refCount: false, bufferSize: 1 }),
    );
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

  private getAggregationCollectionRef(): CollectionReference<unknown, DocumentData> {
    return collection(this.firestore, 'aggregations');
  }
}
