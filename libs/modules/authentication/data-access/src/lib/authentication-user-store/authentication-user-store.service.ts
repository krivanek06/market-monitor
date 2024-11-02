import { Injectable, InjectionToken, inject } from '@angular/core';
import { GroupApiService, OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import {
  OutstandingOrder,
  PortfolioTransaction,
  SymbolStoreBase,
  UserAccountBasicTypes,
  UserData,
} from '@mm/api-types';
import {
  getCurrentDateDefaultFormat,
  getPortfolioStateHoldingBaseByNewTransactionUtil,
  roundNDigits,
} from '@mm/shared/general-util';
import { AuthenticationUserService } from '../authentication-user/authentication-user.service';

export const AUTHENTICATION_ACCOUNT_TOKEN = new InjectionToken<AuthenticationUserStoreService>(
  'AUTHENTICATION_ACCOUNT_TOKEN',
);

@Injectable({
  providedIn: 'root',
})
export class AuthenticationUserStoreService {
  private readonly authenticationUserService = inject(AuthenticationUserService);
  private readonly outstandingOrderApiService = inject(OutstandingOrderApiService);
  private readonly groupApiService = inject(GroupApiService);
  private readonly userApiService = inject(UserApiService);

  readonly state = this.authenticationUserService.state;

  updatePersonal(data: Partial<UserData['personal']>): void {
    const user = this.state.getUserData();
    this.userApiService.updateUser(user.id, {
      ...user,
      personal: {
        ...user.personal,
        ...data,
      },
    });
  }

  updateSettings(data: Partial<UserData['settings']>): void {
    const user = this.state.getUserData();
    this.userApiService.updateUser(user.id, {
      ...user,
      settings: {
        ...user.settings,
        ...data,
      },
    });
  }

  resetTransactions(): void {
    const user = this.state.getUserData();

    // remove orders
    this.outstandingOrderApiService.deleteAllOutstandingOrdersForUser(user.id);

    // reset transactions
    this.userApiService.resetTransactions(user);
  }

  changeAccountType(data: UserAccountBasicTypes): void {
    const userData = this.state.getUserData();

    // update user account type
    this.userApiService.changeAccountType(userData, data);

    // remove user from groups
    userData.groups.groupMember.forEach((groupId) => this.groupApiService.leaveGroup(groupId));

    // clear all sent invitations to groups
    userData.groups.groupInvitations.forEach((groupId) =>
      this.groupApiService.userDeclinesGroupInvitation({
        groupId,
        userId: userData.id,
      }),
    );

    // clear all requests to join groups
    userData.groups.groupRequested.forEach((groupId) =>
      this.groupApiService.removeRequestToJoinGroup({
        groupId,
        userId: userData.id,
      }),
    );
  }

  addSymbolToWatchList(data: SymbolStoreBase): void {
    this.userApiService.addToUserWatchList(this.state.getUserData().id, data);
  }

  removeSymbolFromWatchList(data: SymbolStoreBase): void {
    this.userApiService.removeFromUserWatchList(this.state.getUserData().id, data);
  }

  clearWatchList(): void {
    this.userApiService.clearUserWatchList(this.state.getUserData().id);
  }

  recalculatePortfolioState(): Promise<boolean> {
    return this.userApiService.recalculateUserPortfolioState(this.state.getUserData());
  }

  addPortfolioTransactions(transaction: PortfolioTransaction): void {
    const user = this.state.getUserData();
    const openOrders = this.state.outstandingOrders().openOrders;
    const openOrdersSymbols = openOrders.map((d) => d.symbol);

    // save transaction
    this.userApiService.addUserPortfolioTransactions(this.state.getUserData().id, transaction);

    // recalculate portfolio state
    const { updatedPortfolio, updatedHoldings } = getPortfolioStateHoldingBaseByNewTransactionUtil(
      user.portfolioState,
      user.holdingSnapshot.data,
      openOrders,
      transaction,
    );

    // remove holdings with 0 units if it's not in open orders
    const updatedHoldingsFiltered = updatedHoldings.filter(
      (holding) => holding.units > 0 || openOrdersSymbols.includes(holding.symbol),
    );

    // update user
    this.userApiService.updateUser(user.id, {
      portfolioState: updatedPortfolio,
      holdingSnapshot: {
        lastModifiedDate: getCurrentDateDefaultFormat(),
        data: updatedHoldingsFiltered,
      },
    });
  }

  addOutstandingOrder(order: OutstandingOrder): void {
    const user = this.state.getUserData();

    // save order
    this.outstandingOrderApiService.addOutstandingOrder(order);

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
    this.userApiService.updateUser(user.id, {
      portfolioState: {
        ...user.portfolioState,
        cashOnHand,
      },
      holdingSnapshot: {
        lastModifiedDate: getCurrentDateDefaultFormat(),
        data: holdings,
      },
    });
  }

  removeOutstandingOrder(order: OutstandingOrder): void {
    const user = this.state.getUserData();

    // check if user has the order
    if (order.userData.id !== user.id) {
      throw new Error('User does not have the order');
    }

    // save order
    this.outstandingOrderApiService.deleteOutstandingOrder(order);

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
    this.userApiService.updateUser(user.id, {
      portfolioState: {
        ...user.portfolioState,
        cashOnHand,
      },
      holdingSnapshot: {
        lastModifiedDate: getCurrentDateDefaultFormat(),
        data: holdings,
      },
    });
  }
}
