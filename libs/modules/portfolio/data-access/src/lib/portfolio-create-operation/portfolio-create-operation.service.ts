import { Injectable, inject } from '@angular/core';
import { StocksApiService, UserApiService } from '@mm/api-client';
import {
  DATE_TOO_OLD,
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  HistoricalPrice,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import {
  dateFormatDate,
  dateGetDetailsInformationFromDate,
  formatToLastLastWorkingDate,
  roundNDigits,
} from '@mm/shared/general-util';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCreateOperationService {
  private userApiService = inject(UserApiService);
  private stocksApiService = inject(StocksApiService);

  async createPortfolioCreateOperation(
    userData: UserData,
    data: PortfolioTransactionCreate,
  ): Promise<PortfolioTransaction> {
    // if weekend or holiday is used format to last friday
    data.date = formatToLastLastWorkingDate(data.date);

    // load historical price for symbol on date
    const symbolPrice = await firstValueFrom(
      this.stocksApiService.getStockHistoricalPricesOnDate(data.symbol, dateFormatDate(data.date)),
    );

    // check if symbol exists
    if (!symbolPrice) {
      throw new Error(SYMBOL_NOT_FOUND_ERROR);
    }

    // check data validity
    this.transactionOperationDataValidity(userData, data, symbolPrice);

    // create transaction
    const transaction = this.createTransaction(userData, data, symbolPrice);

    // update user's transactions
    this.userApiService.addUserPortfolioTransactions(userData.id, transaction);

    // return data
    return transaction;
  }

  private createTransaction(
    userDocData: UserData,
    input: PortfolioTransactionCreate,
    historicalPrice: HistoricalPrice,
  ): PortfolioTransaction {
    const isDemoTradingAccount = userDocData.userAccountType === UserAccountEnum.DEMO_TRADING;
    const isSell = input.transactionType === 'SELL';

    // if custom total value is provided calculate unit price, else use API price
    const unitPrice =
      !isDemoTradingAccount && input.customTotalValue
        ? roundNDigits(input.customTotalValue / input.units)
        : historicalPrice.close;

    // from previous transaction calculate invested and units - currently if I own that symbol
    const symbolHolding = userDocData.holdingSnapshot.data.find((d) => d.symbol === input.symbol);

    // calculate break even price if SELL order
    const breakEvenPrice = isSell ? roundNDigits((symbolHolding?.invested ?? 1) / (symbolHolding?.units ?? 1), 2) : 0;

    const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
    const returnChange = isSell ? roundNDigits((unitPrice - breakEvenPrice) / breakEvenPrice) : 0;

    // transaction fees are 0.01% of the transaction value
    const transactionFeesCalc = isDemoTradingAccount ? ((input.units * unitPrice) / 100) * TRANSACTION_FEE_PRCT : 0;
    const transactionFees = roundNDigits(transactionFeesCalc, 2);

    const result: PortfolioTransaction = {
      transactionId: uuidv4(),
      date: input.date,
      symbol: input.symbol,
      units: input.units,
      transactionType: input.transactionType,
      userId: userDocData.id,
      symbolType: input.symbolType,
      unitPrice,
      transactionFees,
      returnChange,
      returnValue,
    };

    return result;
  }

  /**
   *
   * check to make:
   * - user exists
   * - user has enough cash on hand if BUY and cashAccountActive
   * - user has enough units on hand if SELL
   * - units: positive,
   * - date: valid, not weekend, not future, not too old
   * - symbol: exists
   *
   * @param input
   * @param historicalPrice
   * @param portfolioTransaction
   */
  private transactionOperationDataValidity(
    userData: UserData,
    input: PortfolioTransactionCreate,
    historicalPrice: HistoricalPrice,
  ): void {
    // negative units
    if (input.units <= 0) {
      throw new Error(TRANSACTION_INPUT_UNITS_POSITIVE);
    }

    // check if units is integer
    if (input.symbolType !== 'CRYPTO' && !Number.isInteger(input.units)) {
      throw new Error(TRANSACTION_INPUT_UNITS_INTEGER);
    }

    // get year data form input and today
    const { year: inputYear } = dateGetDetailsInformationFromDate(input.date);
    const { year: todayYear } = dateGetDetailsInformationFromDate(new Date());

    // prevent loading more than N year of asset data - just in case
    if (todayYear - inputYear > HISTORICAL_PRICE_RESTRICTION_YEARS) {
      throw new Error(DATE_TOO_OLD);
    }

    // calculate total value
    const totalValue = roundNDigits(input.units * historicalPrice.close, 2);

    // check if user has enough cash on hand if BUY and cashAccountActive
    if (
      input.transactionType === 'BUY' &&
      userData.userAccountType === UserAccountEnum.DEMO_TRADING &&
      userData.portfolioState.cashOnHand < totalValue
    ) {
      throw new Error(USER_NOT_ENOUGH_CASH_ERROR);
    }

    // check if user has enough units on hand if SELL
    if (input.transactionType === 'SELL') {
      // check if user has any holdings of that symbol
      const symbolHoldings = userData.holdingSnapshot.data.find((d) => d.symbol === input.symbol);

      if ((symbolHoldings?.units ?? -1) < input.units) {
        throw new Error(USER_NOT_UNITS_ON_HAND_ERROR);
      }
    }
  }
}
