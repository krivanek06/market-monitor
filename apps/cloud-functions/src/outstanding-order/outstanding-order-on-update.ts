import { OutstandingOrder, UserData } from '@mm/api-types';
import { roundNDigits } from '@mm/shared/general-util';
import { userDocumentRef } from '../database';

export const onOutstandingOrderCreate = async (order: OutstandingOrder): Promise<void> => {
  const userRef = userDocumentRef(order.userData.id);
  const user = (await userRef.get()).data();

  if (!user) {
    console.error(`User not found: ${order.userData.id}`);
    return;
  }

  // what type of order is it
  const isBuy = order.orderType.type === 'BUY';
  const isSell = order.orderType.type === 'SELL';

  // subtract the cash from the user if BUY order
  const cashOnHand = isBuy
    ? roundNDigits(user.portfolioState.cashOnHand - order.potentialTotalPrice)
    : user.portfolioState.cashOnHand;

  // update holdings
  const holdings = user.holdingSnapshot.data.map((holding) => ({
    ...holding,
    // remove owned units if SELL order
    units: holding.symbol === order.symbol && isSell ? holding.units - order.units : holding.units,
  }));

  // update user
  userRef.update({
    portfolioState: {
      ...user.portfolioState,
      cashOnHand,
    },
    holdingSnapshot: {
      lastModifiedDate: new Date().toISOString(),
      data: holdings,
    },
  } satisfies Partial<UserData>);
};

export const onOutstandingOrderDelete = async (order: OutstandingOrder): Promise<void> => {
  const userRef = userDocumentRef(order.userData.id);
  const user = (await userRef.get()).data();

  if (!user) {
    console.error(`User not found: ${order.userData.id}`);
    return;
  }

  // what type of order is it
  const isBuy = order.orderType.type === 'BUY';
  const isSell = order.orderType.type === 'SELL';

  // add the cash back to the user if BUY order
  const cashOnHand = isBuy
    ? roundNDigits(user.portfolioState.cashOnHand + order.potentialTotalPrice)
    : user.portfolioState.cashOnHand;

  // update holdings - add back the units if SELL order
  const holdings = user.holdingSnapshot.data.map((holding) => ({
    ...holding,
    units: holding.symbol === order.symbol && isSell ? holding.units + order.units : holding.units,
  }));

  // update user
  userRef.update({
    portfolioState: {
      ...user.portfolioState,
      cashOnHand,
    },
    holdingSnapshot: {
      lastModifiedDate: new Date().toISOString(),
      data: holdings,
    },
  } satisfies Partial<UserData>);
};
