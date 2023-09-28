import { getSymbolSummary } from '@market-monitor/api-external';
import {
  transactionsCollectionRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '@market-monitor/api-firebase';
import { PortfolioTransaction, SymbolSummary, User, UserPortfolioTransaction } from '@market-monitor/api-types';
import { Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { USER_NOT_NOT_FOUND_ERROR } from '../models';

@Injectable()
export class ApiService {
  async getSymbolSummary(symbol: string): Promise<SymbolSummary> {
    return getSymbolSummary(symbol);
  }

  async getUser(userId: string): Promise<User> {
    const userDoc = await userDocumentRef(userId).get();
    const user = userDoc.data();
    if (!user) {
      throw new Error(USER_NOT_NOT_FOUND_ERROR);
    }
    return user;
  }

  async getUserPortfolioTransaction(userId: string): Promise<UserPortfolioTransaction> {
    const userTransactionHistoryRef = await userDocumentTransactionHistoryRef(userId).get();
    const userTransactions = userTransactionHistoryRef.data();

    if (!userTransactions) {
      throw new Error('No user transactions found');
    }
    return userTransactions;
  }

  async addPortfolioTransactionForUser(userId: string, transaction: PortfolioTransaction): Promise<void> {
    const userTransactionHistoryRef = userDocumentTransactionHistoryRef(userId);

    // save transaction into user document
    await userTransactionHistoryRef.update({
      transactions: firestore.FieldValue.arrayUnion(transaction),
    });
  }

  async deletePortfolioTransactionForUser(userId: string, transactionId: string): Promise<void> {
    const userTransactionHistoryRef = userDocumentTransactionHistoryRef(userId);

    // save transaction into user document
    await userTransactionHistoryRef.update({
      transactions: firestore.FieldValue.arrayRemove({ transactionId }),
    });
  }

  async getPortfolioTransactionForPublic(transactionId: string): Promise<PortfolioTransaction> {
    const publicTransactionRef = await transactionsCollectionRef().doc(transactionId).get();
    const publicTransaction = publicTransactionRef.data();
    if (!publicTransaction) {
      throw new Error('No public transaction found');
    }
    return publicTransaction;
  }

  async addPortfolioTransactionForPublic(transaction: PortfolioTransaction): Promise<void> {
    const publicTransactionRef = transactionsCollectionRef();

    // save transaction into public transactions collection
    await publicTransactionRef.doc(transaction.transactionId).set(transaction);
  }

  async deletePortfolioTransactionForPublic(transactionId: string): Promise<void> {
    const publicTransactionRef = transactionsCollectionRef();

    // delete transaction from public transactions collection
    await publicTransactionRef.doc(transactionId).delete();
  }
}
