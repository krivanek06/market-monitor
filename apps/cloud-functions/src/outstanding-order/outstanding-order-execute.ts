import { getIsMarketOpenCF, getSymbolQuotesCF } from '@mm/api-external';
import { OutstandingOrder, SymbolQuote } from '@mm/api-types';
import { checkTransactionOperationDataValidity, createTransaction } from '@mm/shared/general-util';
import { isSameDay } from 'date-fns';
import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  outstandingOrderCollectionStatusOpenRef,
  outstandingOrderDocRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '../database';
import { recalculateUserPortfolioStateToUser } from '../portfolio';

export const outstandingOrderExecute = async (order: OutstandingOrder) => {
  // check if market is open
  const marketData = await getIsMarketOpenCF();

  // if market is closed, do not execute any orders
  if (order.sector !== 'CRYPTO' && !marketData?.isTheStockMarketOpen) {
    console.log('Market is closed, not executing any orders');
    return;
  }

  // caching symbol quotes
  const symbolQuotesMap = new Map<string, SymbolQuote>();

  // get quotes for all symbols
  await outstandingOrderGetQuotes([order], symbolQuotesMap);

  // execute order
  await outstandingOrderExecuteForUserId([order], symbolQuotesMap);
};

/**
 * load all outstanding orders and try execute them
 */
export const outstandingOrdersExecuteAll = async () => {
  // check if market is open
  const marketData = await getIsMarketOpenCF();

  // if market is closed, do not execute any orders
  if (!marketData?.isTheStockMarketOpen) {
    console.log('Market is closed, not executing any orders');
    return;
  }

  // load all open orders
  const openOrders = await outstandingOrderCollectionStatusOpenRef().get();
  const openOrdersData = openOrders.docs.map((doc) => doc.data());

  // group orders by user id
  const ordersByUserId = openOrdersData.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.userData.id]: [...(acc[curr.userData.id] || []), curr],
    }),
    {} as Record<string, OutstandingOrder[]>,
  );

  console.log(`Found ${openOrdersData.length} open orders for ${Object.keys(ordersByUserId).length} users`);

  // caching symbol quotes
  const symbolQuotesMap = new Map<string, SymbolQuote>();

  // try to execute orders for each user
  for (const userId in ordersByUserId) {
    // get orders per user
    const orders = ordersByUserId[userId];
    // get quotes for all symbols
    await outstandingOrderGetQuotes(orders, symbolQuotesMap);
    // execute orders
    await outstandingOrderExecuteForUserId(orders, symbolQuotesMap);
  }
};

const outstandingOrderGetQuotes = async (orders: OutstandingOrder[], cached: Map<string, SymbolQuote>) => {
  // get unsaved quotes
  const unsavedQuotes = [...new Set(orders.map((d) => d.symbol))].filter((d) => !cached.has(d));
  // load quotes
  const quotes = await getSymbolQuotesCF(unsavedQuotes);
  // save quotes to cache
  quotes.forEach((quote) => cached.set(quote.symbol, quote));
};

/**
 * todo - can happen that I have 2 BUY orders and both overflow with total price, so cash may be negative
 * @param userId - user id whom to execute orders
 * @param orders - orders to execute
 * @param symbolQuotesMap - cached symbol quotes
 * @returns
 */
const outstandingOrderExecuteForUserId = async (
  orders: OutstandingOrder[],
  symbolQuotesMap: Map<string, SymbolQuote>,
) => {
  if (orders.length === 0) {
    return;
  }

  // check if all orders belong to a single user
  const userIds = [...new Set(orders.map((d) => d.userData.id))];
  if (userIds.length > 1) {
    const distinctUserIds = [...new Set(userIds)];
    console.error(`[OUTSTANDING_ORDER]: Orders belong to multiple users: ${distinctUserIds.join(', ')}`);
    return;
  }

  // get user's id
  const userId = userIds[0];

  // get firestore instance
  const db = firestore();

  // get user
  const userRef = userDocumentRef(userId);
  const userData = (await userRef.get()).data();

  if (!userData) {
    console.error(`[OUTSTANDING_ORDER]: User ${userId} not found`);
    return;
  }

  // log what's happening
  console.log(`[OUTSTANDING_ORDER]: Executing orders for user ${userData.id}, orders: ${orders.length}`);

  // execute orders as one transaction
  for (const order of orders) {
    const quote = symbolQuotesMap.get(order.symbol);

    // check if quote is available and is from today
    if (!quote) {
      console.error(`[OUTSTANDING_ORDER]: Failed to get quote for symbol ${order.symbol}`);
      continue;
    }

    // problem: check if quote is from today (when market opens some quotes are from yesterday)
    const quoteDate = new Date(quote.timestamp * 1000);
    if (!isSameDay(quoteDate, new Date())) {
      console.error(`[OUTSTANDING_ORDER]: Symbol ${order.symbol} is not from today, timestamp: ${quote.timestamp}`);
      continue;
    }

    // calculate the new current total of the order
    const currentTotal = order.units * quote.price;

    // if potentialTotalPrice was 100 and now it's 110, priceDiff is 10
    const priceDiff = currentTotal - order.potentialTotalPrice;

    // create transaction
    const potentialTransaction = createTransaction(userData, userData.holdingSnapshot.data, order, quote.price);

    // make some validations here
    checkTransactionOperationDataValidity(userData, order);

    // check if user has enough money
    if (
      order.orderType.type === 'BUY' &&
      userData.portfolioState.cashOnHand < priceDiff + potentialTransaction.transactionFees
    ) {
      console.error(`[OUTSTANDING_ORDER]: User ${userData.id} not enough money, order ${order.orderId}`);
      continue;
    }

    try {
      await db.runTransaction(async (firebaseTransaction) => {
        // update user's transactions
        firebaseTransaction.update(userDocumentTransactionHistoryRef(userData.id), {
          transactions: FieldValue.arrayUnion(potentialTransaction),
        });

        // delete the order - close it
        firebaseTransaction.delete(outstandingOrderDocRef(order.orderId));
      });
    } catch (error) {
      console.error(`[OUTSTANDING_ORDER]: Failed to execute order ${order.orderId}`);
      console.error(error);
    }
  }

  // recalculate user's portfolio state - new transaction appeared
  await recalculateUserPortfolioStateToUser(userData);
};
