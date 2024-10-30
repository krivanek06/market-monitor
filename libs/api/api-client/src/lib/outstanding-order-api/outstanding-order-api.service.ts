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
import { OutstandingOrder, PortfolioState, PortfolioStateHoldingBase } from '@mm/api-types';
import { assignTypesClient } from '@mm/shared/data-access';
import { roundNDigits } from '@mm/shared/general-util';
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
   * based on the NEW order, calculate the new portfolio state and holdings
   * - when order is BUY - subtract cash
   * - when order is SELL - remove units from holding
   *
   * @param portfolioState - user's current portfolio state
   * @param currentHoldings - user's current holdings
   * @param order
   * @returns
   */
  calculatePortfolioAndHoldingByNewOrder(
    portfolioState: PortfolioState,
    currentHoldings: PortfolioStateHoldingBase[],
    order: OutstandingOrder,
  ): {
    portfolioState: PortfolioState;
    holdings: PortfolioStateHoldingBase[];
  } {
    // what type of order is it
    const isBuy = order.orderType.type === 'BUY';
    const isSell = order.orderType.type === 'SELL';

    // subtract the cash from the user if BUY order
    const cashOnHand = isBuy
      ? roundNDigits(portfolioState.cashOnHand - order.potentialTotalPrice)
      : portfolioState.cashOnHand;

    // update holdings
    const holdings = currentHoldings.map((holding) => ({
      ...holding,
      // remove owned units if SELL order
      units: holding.symbol === order.symbol && isSell ? holding.units - order.units : holding.units,
    }));

    return {
      portfolioState: {
        ...portfolioState,
        cashOnHand,
      },
      holdings,
    };
  }

  /**
   * based on the DELETED order, calculate the new portfolio state and holdings
   * - when order is BUY - add cash back
   * - when order is SELL - add units to holding back
   *
   * @param portfolioState - user's current portfolio state
   * @param currentHoldings - user's current holdings
   * @param order
   * @returns
   */
  calculatePortfolioAndHoldingByOrderDelete(
    portfolioState: PortfolioState,
    currentHoldings: PortfolioStateHoldingBase[],
    order: OutstandingOrder,
  ) {
    // what type of order is it
    const isBuy = order.orderType.type === 'BUY';
    const isSell = order.orderType.type === 'SELL';

    // add the cash back to the user if BUY order
    const cashOnHand = isBuy
      ? roundNDigits(portfolioState.cashOnHand + order.potentialTotalPrice)
      : portfolioState.cashOnHand;

    // update holdings - add back the units if SELL order
    const holdings = currentHoldings.map((holding) => ({
      ...holding,
      units: holding.symbol === order.symbol && isSell ? holding.units + order.units : holding.units,
    }));

    return {
      portfolioState: {
        ...portfolioState,
        cashOnHand,
      },
      holdings,
    };
  }

  private getOutstandingOrderDocRef(orderId: string): DocumentReference<OutstandingOrder> {
    return doc(this.outstandingOrdersCollection(), orderId);
  }

  private outstandingOrdersCollection(): CollectionReference<OutstandingOrder, DocumentData> {
    return collection(this.firestore, 'outstanding_orders').withConverter(assignTypesClient<OutstandingOrder>());
  }
}
