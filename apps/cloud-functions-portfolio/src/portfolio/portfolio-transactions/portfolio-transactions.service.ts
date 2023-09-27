import { getSymbolSummary } from '@market-monitor/api-external';
import {
  transactionDocumentRef,
  transactionsCollectionRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '@market-monitor/api-firebase';
import {
  PortfolioTransaction,
  PortfolioTransactionCreate,
  PortfolioTransactionDelete,
  SymbolSummary,
  User,
  UserPortfolioTransaction,
} from '@market-monitor/api-types';
import { dateGetDetailsInformationFromDate, roundNDigits } from '@market-monitor/shared/utils-general';
import { Injectable } from '@nestjs/common';
import { isBefore, isValid, isWeekend } from 'date-fns';
import { firestore } from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_FEE_PRCT } from '../model';

/**
 *
 */

@Injectable()
export class PortfolioTransactionsService {
  async executeTransactionOperation(input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    // get references
    const userDocRef = userDocumentRef(input.userId);
    const userTransactionHistoryRef = userDocumentTransactionHistoryRef(input.userId);
    const publicTransactionRef = transactionsCollectionRef();

    // get data
    const [userDoc, userTransactionsDoc, symbolSummary] = await Promise.all([
      userDocRef.get(),
      userTransactionHistoryRef.get(),
      getSymbolSummary(input.symbol),
    ]);
    const user = userDoc.data();
    const userTransactions = userTransactionsDoc.data();

    // from previous transaction calculate invested and units - currently if I own that symbol
    const symbolHolding = this.getCurrentInvestedFromTransactions(input.symbol, userTransactions.transactions);
    const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

    // check data validity
    this.executeTransactionOperationDataValidity(input, user, symbolSummary, userTransactions);

    // create transaction
    const transaction = this.createTransaction(input, user, symbolSummary, symbolHoldingBreakEvenPrice);

    // save transaction into public transactions collection
    await publicTransactionRef.doc(transaction.transactionId).set(transaction);

    // save transaction into user document
    await userTransactionHistoryRef.update({
      transactions: firestore.FieldValue.arrayUnion(transaction),
    });

    // return data
    return transaction;
  }

  async deleteTransactionOperation(input: PortfolioTransactionDelete): Promise<PortfolioTransaction> {
    // get references
    const userDocRef = userDocumentRef(input.userId);
    const userTransactionHistoryRef = userDocumentTransactionHistoryRef(input.userId);
    const publicTransactionRef = transactionDocumentRef(input.transactionId);

    // get data
    const [userDoc, userTransactionsDoc, removedTransactionDoc] = await Promise.all([
      userDocRef.get(),
      userTransactionHistoryRef.get(),
      publicTransactionRef.get(),
    ]);
    const user = userDoc.data();
    const userTransactions = userTransactionsDoc.data();
    const removedTransaction = removedTransactionDoc.data();

    if (!userTransactions || !removedTransaction) {
      throw new Error('No transaction history found');
    }

    if (!user) {
      throw new Error('No user found');
    }

    // remove transaction from public transactions collection
    await publicTransactionRef.delete();

    // remove transaction from user document
    const transactions = userTransactions.transactions.filter((d) => d.transactionId !== input.transactionId);
    await userTransactionHistoryRef.update({
      transactions: transactions,
    });

    return removedTransaction;
  }

  private getCurrentInvestedFromTransactions(
    symbol: string,
    userTransactions: PortfolioTransaction[],
  ): { units: number; invested: number } {
    return userTransactions
      .filter((d) => d.symbol === symbol)
      .reduce(
        (acc, curr) => ({
          ...acc,
          invested:
            acc.invested +
            (curr.transactionType === 'BUY' ? curr.unitPrice * curr.units : -curr.unitPrice * curr.units),
          units: acc.units + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
        }),
        { invested: 0, units: 0 } as { units: number; invested: number },
      );
  }

  private createTransaction(
    input: PortfolioTransactionCreate,
    user: User,
    symbolSummary: SymbolSummary,
    breakEvenPrice: number,
  ): PortfolioTransaction {
    const isTransactionFeesActive = user.settings.isTransactionFeesActive;
    const unitPrice = symbolSummary.quote.price;

    const isSell = input.transactionType === 'SELL';
    const returnValue = isSell ? (unitPrice - breakEvenPrice) * input.units : null;
    const returnChange = isSell ? (unitPrice - breakEvenPrice) / breakEvenPrice : null;

    // transaction fees are 0.01% of the transaction value
    const transactionFeesCalc = isTransactionFeesActive ? ((input.units * unitPrice) / 100) * TRANSACTION_FEE_PRCT : 0;
    const transactionFees = roundNDigits(transactionFeesCalc, 2);

    const result: PortfolioTransaction = {
      transactionId: uuidv4(),
      date: input.date,
      symbol: input.symbol,
      units: input.units,
      transactionType: input.transactionType,
      userId: input.userId,
      userPhotoURL: user.personal.photoURL,
      userDisplayName: user.personal.displayName,
      symbolType: input.symbolType,
      unitPrice,
      transactionFees,
      returnChange,
      returnValue,
    };

    return result;
  }

  /**
   * check to make:
   * - user exists
   * - user has enough cash on hand if BUY and cashAccountActive
   * - user has enough units on hand if SELL
   * - units: positive,
   * - date: valid, not weekend, not future, not too old
   * - symbol: exists
   *
   * @param input
   * @param user
   */
  private executeTransactionOperationDataValidity(
    input: PortfolioTransactionCreate,
    user?: User,
    symbolSummary?: SymbolSummary,
    userTransactionHistory?: UserPortfolioTransaction,
  ): void {
    // throw error if no user
    if (!user) {
      throw new Error('No user found');
    }

    // throw error if no transaction history
    if (!userTransactionHistory) {
      throw new Error('No transaction history found');
    }

    // negative units
    if (input.units <= 0) {
      throw new Error('Units must be positive');
    }

    // check if symbol exists
    if (!symbolSummary) {
      throw new Error('Symbol not found');
    }

    // check if date is valid
    if (!isValid(new Date(input.date))) {
      throw new Error('Invalid date');
    }

    // do not allow selecting weekend for date
    if (isWeekend(new Date(input.date))) {
      throw new Error('Weekend as date is not allowed');
    }

    // prevent adding future holdings
    if (isBefore(new Date(), new Date(input.date))) {
      throw new Error('Future date is not allowed');
    }

    // get year data form input and today
    const { year: inputYear } = dateGetDetailsInformationFromDate(input.date);
    const { year: todayYear } = dateGetDetailsInformationFromDate(new Date());

    // prevent loading more than N year of asset data or future data - just in case
    if (todayYear - inputYear > 10) {
      throw new Error('Too old data');
    }

    // calculate total value
    const totalValue = input.units * symbolSummary.quote.price;

    // check if user has enough cash on hand if BUY and cashAccountActive
    if (input.transactionType === 'BUY' && user.settings.isPortfolioCashActive) {
      const cashOnHand = userTransactionHistory.cashDeposit.reduce((acc, curr) => acc + curr.amount, 0);
      if (cashOnHand < totalValue) {
        throw new Error('Error User - Not enough cash on hand');
      }
    }

    // check if user has enough units on hand if SELL
    if (input.transactionType === 'SELL') {
      // check if user has any holdings of that symbol
      const symbolTransactions = userTransactionHistory.transactions.filter((d) => d.symbol === input.symbol);
      if (symbolTransactions.length === 0) {
        throw new Error('Error User - No holding found');
      }

      // calculate holding units
      const holdingUnits = symbolTransactions.reduce(
        (acc, curr) => acc + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
        0,
      );
      if (holdingUnits < input.units) {
        throw new Error('Error User - Not enough units on hand');
      }
    }
  }
}
