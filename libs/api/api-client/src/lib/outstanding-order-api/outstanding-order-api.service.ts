import { inject, Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  limit,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { OUTSTANDING_ORDERS_MAX_ORDERS, OutstandingOrder, UserBaseMin } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OutstandingOrderApiService {
  private readonly firestore = inject(Firestore);

  getOutstandingOrder(orderId: string): Observable<OutstandingOrder | undefined> {
    return rxDocData(this.getOutstandingOrderDocRef(orderId));
  }

  /** get all open orders */
  getOutstandingOrders(userId: string): Observable<OutstandingOrder[]> {
    return rxCollectionData(
      query(
        this.outstandingOrdersCollection(),
        where('userData.id', '==', userId),
        limit(OUTSTANDING_ORDERS_MAX_ORDERS),
      ),
    );
  }

  addOutstandingOrder(order: OutstandingOrder): void {
    setDoc(this.getOutstandingOrderDocRef(order.orderId), order);
  }

  deleteOutstandingOrder(order: OutstandingOrder, userBase: UserBaseMin): void {
    // check if user has the order
    if (order.userData.id !== userBase.id) {
      throw new Error('User does not have the order');
    }

    // delete the order
    deleteDoc(this.getOutstandingOrderDocRef(order.orderId));
  }

  private getOutstandingOrderDocRef(orderId: string): DocumentReference<OutstandingOrder> {
    return doc(this.outstandingOrdersCollection(), orderId);
  }

  private outstandingOrdersCollection(): CollectionReference<OutstandingOrder, DocumentData> {
    return collection(this.firestore, 'outstanding_orders').withConverter(assignTypesClient<OutstandingOrder>());
  }
}
