import { inject, Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { OutstandingOrder, UserBase } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';

@Injectable({
  providedIn: 'root',
})
export class OutstandingOrderApiService {
  private readonly firestore = inject(Firestore);

  addOutstandingOrder(order: OutstandingOrder): void {
    setDoc(this.getOutstandingOrderDocRef(order.orderId), order);
  }

  editOutstandingOrder(order: OutstandingOrder, userBase: UserBase): void {
    // check if user has the order
    if (order.userData.id !== userBase.id) {
      throw new Error('User does not have the order');
    }

    // update the order
    setDoc(this.getOutstandingOrderDocRef(order.orderId), order);
  }

  deleteOutstandingOrder(order: OutstandingOrder, userBase: UserBase): void {
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
