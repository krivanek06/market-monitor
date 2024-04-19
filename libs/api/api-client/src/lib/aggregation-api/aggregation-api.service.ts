import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollectionReference, DocumentData, DocumentReference, Firestore, collection } from '@angular/fire/firestore';
import { HallOfFameGroups, HallOfFameUsers } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { doc } from 'firebase/firestore';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AggregationApiService {
  private firestore = inject(Firestore);

  hallOfFameUsers = toSignal(this.getHallOfFameUsers());
  hallOfFameGroups = toSignal(this.getHallOfFameGroups());

  private getHallOfFameUsers(): Observable<HallOfFameUsers | undefined> {
    // cache the data
    return rxDocData(this.getHallOfFameUsersDocRef()).pipe(shareReplay({ refCount: false, bufferSize: 1 }));
  }

  private getHallOfFameGroups(): Observable<HallOfFameGroups | undefined> {
    // cache the data
    return rxDocData(this.getHallOfFameGroupsDocRef()).pipe(shareReplay({ refCount: false, bufferSize: 1 }));
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
