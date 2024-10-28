import { getIsMarketOpenCF, getSymbolQuotesCF } from '@mm/api-external';
import { OutstandingOrder, SymbolQuote } from '@mm/api-types';
import { createTransaction, getCurrentDateDetailsFormat } from '@mm/shared/general-util';
import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  outstandingOrderCollectionStatusOpenRef,
  outstandingOrderDocRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '../database';

/**
 * load all outstanding orders and try execute them
 *
 * todo - can happen that I have 2 BUY orders and both overflow with total price, so cash may be negative
 */
export const outstandingOrderExecute = async () => {
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

  // get firestore instance
  const db = firestore();

  // try to execute orders for each user
  for (const userId in ordersByUserId) {
    const orders = ordersByUserId[userId];

    // get user
    const userRef = userDocumentRef(userId);
    const userData = (await userRef.get()).data();

    if (!userData) {
      continue;
    }

    console.log(`Executing orders for user ${userData.id}, orders: ${orders.length}`);

    // get symbol quotes
    const unsavedQuotes = [...new Set(orders.map((d) => d.symbol))].filter((d) => !symbolQuotesMap.has(d));
    const quotes = await getSymbolQuotesCF(unsavedQuotes);
    for (const quote of quotes) {
      symbolQuotesMap.set(quote.symbol, quote);
    }

    // execute orders as one transaction
    try {
      await db.runTransaction(async (firebaseTransaction) => {
        for (const order of orders) {
          const quote = symbolQuotesMap.get(order.symbol);

          if (quote) {
            // calculate the new current total of the order
            const currentTotal = order.units * quote.price;
            // if potentialTotalPrice was 100 and now it's 110, priceDiff is 10
            const priceDiff = currentTotal - order.potentialTotalPrice;

            const potentialTransaction = createTransaction(userData, order, quote.price);

            // check if user has enough money
            if (
              order.orderType.type === 'BUY' &&
              userData.portfolioState.cashOnHand < priceDiff + potentialTransaction.transactionFees
            ) {
              console.error(`User ${userData.id} does not have enough money to execute order ${order.orderId}`);
              return;
            }

            // update user's transactions
            firebaseTransaction.update(userDocumentTransactionHistoryRef(userData.id), {
              transactions: FieldValue.arrayUnion(potentialTransaction),
            });

            // update the order - close it
            firebaseTransaction.update(outstandingOrderDocRef(order.orderId), {
              status: 'CLOSED',
              closedAt: getCurrentDateDetailsFormat(),
              finalSymbolPrice: quote.price,
              finalTotalPrice: currentTotal,
            } satisfies Partial<OutstandingOrder>);
          } else {
            console.error(`Failed to get quote for symbol ${order.symbol}`);
          }
        }
      });
    } catch (error) {
      console.error(`Error executing orders for user ${userData.id}: ${error}`);
    }
  }
};

// todo - may happen that price changed so much that user may be in negative cash
