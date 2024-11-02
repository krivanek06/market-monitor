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
import { OutstandingOrder } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { collectionData as rxCollectionData, docData as rxDocData } from 'rxfire/firestore';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OutstandingOrderApiService {
  private readonly firestore = inject(Firestore);

  getOutstandingOrder(orderId: string): Observable<OutstandingOrder | undefined> {
    return rxDocData(this.getOutstandingOrderDocRef(orderId));
  }

  /** get all open orders */
  getOutstandingOrdersOpen(userId: string): Observable<OutstandingOrder[]> {
    return rxCollectionData(
      query(this.outstandingOrdersCollection(), where('userData.id', '==', userId), where('status', '==', 'OPEN')),
    );
  }

  getOutstandingOrdersClosed(userId: string): Observable<OutstandingOrder[]> {
    return rxCollectionData(
      query(
        this.outstandingOrdersCollection(),
        where('userData.id', '==', userId),
        where('status', '==', 'CLOSED'),
        limit(10),
      ),
    );
  }

  addOutstandingOrder(order: OutstandingOrder): void {
    setDoc(this.getOutstandingOrderDocRef(order.orderId), order);
  }

  deleteOutstandingOrder(order: OutstandingOrder): void {
    deleteDoc(this.getOutstandingOrderDocRef(order.orderId));
  }

  /**
   * delete all outstanding orders for a user - used when resetting the user portfolio
   */
  async deleteAllOutstandingOrdersForUser(userId: string) {
    // get all orders
    const orders = await firstValueFrom(
      rxCollectionData(query(this.outstandingOrdersCollection(), where('userData.id', '==', userId))),
    );

    // delete all orders
    orders.forEach((order) => {
      deleteDoc(this.getOutstandingOrderDocRef(order.orderId));
    });
  }

  private getOutstandingOrderDocRef(orderId: string): DocumentReference<OutstandingOrder> {
    return doc(this.outstandingOrdersCollection(), orderId);
  }

  private outstandingOrdersCollection(): CollectionReference<OutstandingOrder, DocumentData> {
    return collection(this.firestore, 'outstanding_orders').withConverter(assignTypesClient<OutstandingOrder>());
  }
}
