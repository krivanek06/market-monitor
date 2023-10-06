import { Injectable } from '@angular/core';
import { MarketApiService, PortfolioApiService, UserApiService } from '@market-monitor/api-client';
import {
  PortfolioTransaction,
  PortfolioTransactionCreate,
  PortfolioTransactionDelete,
  SymbolSummary,
  UserPortfolioTransaction,
} from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { dateGetDetailsInformationFromDate, roundNDigits } from '@market-monitor/shared/utils-general';
import { isBefore, isValid, isWeekend } from 'date-fns';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  DATE_FUTURE,
  DATE_INVALID_DATE,
  DATE_TOO_OLD,
  DATE_WEEKEND,
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_HISTORY_NOT_FOUND_ERROR,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioOperationsService {
  constructor(
    private marketApiService: MarketApiService,
    private authenticationUserService: AuthenticationUserService,
    private portfolioApiService: PortfolioApiService,
    private userApiService: UserApiService,
  ) {}

  async executeTransactionOperation(input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    // get data
    const userTransactions = await this.authenticationUserService.getUserPortfolioTransactionPromise();
    const symbolSummary = await firstValueFrom(this.marketApiService.getSymbolSummary(input.symbol));

    // check if symbol exists
    if (!symbolSummary) {
      throw new Error(SYMBOL_NOT_FOUND_ERROR);
    }

    // check data validity
    this.executeTransactionOperationDataValidity(input, symbolSummary, userTransactions);

    // from previous transaction calculate invested and units - currently if I own that symbol
    const symbolHolding = this.getCurrentInvestedFromTransactions(input.symbol, userTransactions.transactions);
    const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

    // create transaction
    const transaction = this.createTransaction(input, symbolSummary, symbolHoldingBreakEvenPrice);

    // save transaction into public transactions collection
    this.portfolioApiService.addPortfolioTransactionForPublic(transaction);

    // save transaction into user document
    this.userApiService.addPortfolioTransactionForUser(transaction);

    // return data
    return transaction;
  }

  async deleteTransactionOperation(input: PortfolioTransactionDelete): Promise<PortfolioTransaction> {
    // get data
    const userTransactions = await this.authenticationUserService.getUserPortfolioTransactionPromise();
    const removedTransaction = await this.portfolioApiService.getPortfolioTransactionPublicPromise(input.transactionId);

    if (!userTransactions || !removedTransaction) {
      throw new Error(TRANSACTION_HISTORY_NOT_FOUND_ERROR);
    }

    // remove transaction from public transactions collection
    this.portfolioApiService.deletePortfolioTransactionForPublic(input.transactionId);

    // remove transaction from user document
    this.userApiService.deletePortfolioTransactionForUser(input.userId, input.transactionId);

    // return removed transaction
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
    symbolSummary: SymbolSummary,
    breakEvenPrice: number,
  ): PortfolioTransaction {
    const userData = this.authenticationUserService.userData;
    const isTransactionFeesActive = userData.settings.isTransactionFeesActive;

    // if custom total value is provided calculate unit price, else use API price
    const unitPrice = input.customTotalValue
      ? roundNDigits(input.customTotalValue / input.units)
      : symbolSummary.quote.price;

    const isSell = input.transactionType === 'SELL';
    const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
    const returnChange = isSell ? roundNDigits((unitPrice - breakEvenPrice) / breakEvenPrice) : 0;

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
    symbolSummary: SymbolSummary,
    userTransactionHistory: UserPortfolioTransaction,
  ): void {
    const userData = this.authenticationUserService.userData;

    // negative units
    if (input.units <= 0) {
      throw new Error(TRANSACTION_INPUT_UNITS_POSITIVE);
    }

    // check if units is integer
    if (input.symbolType !== 'CRYPTO' && !Number.isInteger(input.units)) {
      throw new Error(TRANSACTION_INPUT_UNITS_INTEGER);
    }

    // check if date is valid
    if (!isValid(new Date(input.date))) {
      throw new Error(DATE_INVALID_DATE);
    }

    // prevent adding future holdings
    if (isBefore(new Date(), new Date(input.date))) {
      throw new Error(DATE_FUTURE);
    }

    // do not allow selecting weekend for date
    if (isWeekend(new Date(input.date))) {
      throw new Error(DATE_WEEKEND);
    }

    // get year data form input and today
    const { year: inputYear } = dateGetDetailsInformationFromDate(input.date);
    const { year: todayYear } = dateGetDetailsInformationFromDate(new Date());

    // prevent loading more than N year of asset data - just in case
    if (todayYear - inputYear > HISTORICAL_PRICE_RESTRICTION_YEARS) {
      throw new Error(DATE_TOO_OLD);
    }

    // calculate total value
    const totalValue = input.units * symbolSummary.quote.price;

    // check if user has enough cash on hand if BUY and cashAccountActive
    if (input.transactionType === 'BUY' && userData.settings.isPortfolioCashActive) {
      const cashOnHand = userTransactionHistory.cashDeposit.reduce((acc, curr) => acc + curr.amount, 0);
      if (cashOnHand < totalValue) {
        throw new Error(USER_NOT_ENOUGH_CASH_ERROR);
      }
    }

    // check if user has enough units on hand if SELL
    if (input.transactionType === 'SELL') {
      // check if user has any holdings of that symbol
      const symbolTransactions = userTransactionHistory.transactions.filter((d) => d.symbol === input.symbol);

      // calculate holding units
      const holdingUnits = symbolTransactions.reduce(
        (acc, curr) => acc + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
        0,
      );
      if (holdingUnits < input.units) {
        throw new Error(USER_NOT_UNITS_ON_HAND_ERROR);
      }
    }
  }
}
