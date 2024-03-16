import { Injectable, inject } from '@angular/core';
import { CollectionReference, DocumentData, DocumentReference, Firestore, collection } from '@angular/fire/firestore';
import { HallOfFameGroups, HallOfFameUsers } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { doc } from 'firebase/firestore';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AggregationApiService {
  private firestore = inject(Firestore);

  getHallOfFameUsers(): Observable<HallOfFameUsers | undefined> {
    return rxDocData(this.getHallOfFameUsersDocRef());
  }

  getHallOfFameGroups(): Observable<HallOfFameGroups | undefined> {
    return rxDocData(this.getHallOfFameGroupsDocRef());
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
