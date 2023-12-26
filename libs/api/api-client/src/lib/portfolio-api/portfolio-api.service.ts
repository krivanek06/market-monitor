import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, deleteDoc, doc, setDoc } from '@angular/fire/firestore';
import { PortfolioRisk, PortfolioTransaction } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/data-access';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  constructor(private firestore: Firestore) {}

  // TODO: calculation on backend
  getPortfolioRiskByUser(userId: string): Observable<PortfolioRisk | null> {
    return of(null);
  }

  addPortfolioTransactionForPublic(transaction: PortfolioTransaction): void {
    setDoc(this.getPortfolioTransactionPublicRef(transaction.transactionId), transaction);
  }

  deletePortfolioTransactionForPublic(transactionId: string): Promise<void> {
    return deleteDoc(this.getPortfolioTransactionPublicRef(transactionId));
  }

  updatePortfolioTransactionPublic(id: string, transaction: Partial<PortfolioTransaction>): Promise<void> {
    return setDoc(this.getPortfolioTransactionPublicRef(id), transaction, { merge: true });
  }

  private getPortfolioTransactionPublicRef(transactionId: string): DocumentReference<PortfolioTransaction> {
    return doc(this.firestore, 'transactions', transactionId).withConverter(assignTypesClient<PortfolioTransaction>());
  }
}
