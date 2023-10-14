import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, deleteDoc, doc, setDoc } from '@angular/fire/firestore';
import { PortfolioRisk, PortfolioTransaction } from '@market-monitor/api-types';
import { assignTypesClient } from '@market-monitor/shared/utils-client';
import { docData as rxDocData } from 'rxfire/firestore';
import { Observable, firstValueFrom, of } from 'rxjs';
import { MarketApiService } from '../market-api/market-api.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  constructor(
    private marketApiService: MarketApiService,
    private firestore: Firestore,
  ) {}

  // todo load all transaction from user and calculate portfolio
  getPortfolioTransactionsByUser(userId: string): Observable<PortfolioTransaction[]> {
    return of([]);
  }

  // TODO: calculation on backend
  getPortfolioRiskByUser(userId: string): Observable<PortfolioRisk | null> {
    return of(null);
  }

  getPortfolioTransactionPublic(transactionId: string): Observable<PortfolioTransaction | undefined> {
    return rxDocData(this.getPortfolioTransactionPublicRef(transactionId));
  }

  getPortfolioTransactionPublicPromise(transactionId: string): Promise<PortfolioTransaction | undefined> {
    return firstValueFrom(this.getPortfolioTransactionPublic(transactionId));
  }

  addPortfolioTransactionForPublic(transaction: PortfolioTransaction): void {
    setDoc(this.getPortfolioTransactionPublicRef(transaction.transactionId), transaction);
  }

  deletePortfolioTransactionForPublic(transactionId: string): void {
    deleteDoc(this.getPortfolioTransactionPublicRef(transactionId));
  }

  updatePortfolioTransactionPublic(id: string, transaction: Partial<PortfolioTransaction>): void {
    setDoc(this.getPortfolioTransactionPublicRef(id), transaction, { merge: true });
  }

  private getPortfolioTransactionPublicRef(transactionId: string): DocumentReference<PortfolioTransaction> {
    return doc(this.firestore, 'transactions', transactionId).withConverter(assignTypesClient<PortfolioTransaction>());
  }
}
