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
  // update user
  userRef.update({
    portfolioState: {
      ...user.portfolioState,
      cashOnHand: roundNDigits(user.portfolioState.cashOnHand - order.potentialTotalPrice),
    },
  } satisfies Partial<UserData>);
};

/**
 * - check if units or price changed and update user's cash on hand
 * - check if it was closed and update user's cash on hand (add back the cash)
 */
export const onOutstandingOrderEdit = async (oldOrder: OutstandingOrder, newOrder: OutstandingOrder): Promise<void> => {
  const userRef = userDocumentRef(oldOrder.userData.id);
  const user = (await userRef.get()).data();

  if (!user) {
    console.error(`User not found: ${oldOrder.userData.id}`);
    return;
  }

  // don't do if the status remained the same
  if (oldOrder.status === 'CLOSED' && newOrder.status === 'CLOSED') {
    return;
  }

  // check if it was closed and update user's cash on hand (add back the cash)
  if (oldOrder.status === 'OPEN' && newOrder.status === 'CLOSED') {
    userRef.update({
      portfolioState: {
        ...user.portfolioState,
        cashOnHand: roundNDigits(user.portfolioState.cashOnHand + oldOrder.potentialTotalPrice),
      },
    } satisfies Partial<UserData>);

    return;
  }

  // update user's cash on hand - probably the units or price changed
  userRef.update({
    portfolioState: {
      ...user.portfolioState,
      cashOnHand: roundNDigits(
        user.portfolioState.cashOnHand + oldOrder.potentialTotalPrice - newOrder.potentialTotalPrice,
      ),
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

  // update user - add back the cash
  userRef.update({
    portfolioState: {
      ...user.portfolioState,
      cashOnHand: roundNDigits(user.portfolioState.cashOnHand + order.potentialTotalPrice),
    },
  } satisfies Partial<UserData>);
};
