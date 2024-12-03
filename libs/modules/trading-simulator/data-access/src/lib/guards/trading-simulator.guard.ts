import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { TradingSimulatorApiService } from '@mm/api-client';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { map } from 'rxjs';

export const tradingSimulatorEditGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthenticationUserStoreService);
  const tradingSimulatorApiService = inject(TradingSimulatorApiService);
  const router = inject(Router);
  const dialogServiceUtil = inject(DialogServiceUtil);
  const user = authService.state().userData;

  const simulatorId = String(route.paramMap.get('id'));

  return tradingSimulatorApiService.getTradingSimulatorById(simulatorId).pipe(
    map((simulator) => {
      // check if simulator exists
      if (!simulator) {
        dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
        router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
        return false;
      }

      // check if simulator is in draft state
      if (simulator.state !== 'draft') {
        dialogServiceUtil.showNotificationBar('Trading simulator is not in draft state', 'error');
        router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
        return false;
      }

      // check if user is the owner
      if (user && user?.id !== simulator.owner.id) {
        dialogServiceUtil.showNotificationBar('You are not the owner of this simulator', 'error');
        router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
        return false;
      }

      return true;
    }),
  );
};

export const tradingSimulatorDetailsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const dialogServiceUtil = inject(DialogServiceUtil);
  const tradingSimulatorApiService = inject(TradingSimulatorApiService);
  const router = inject(Router);

  const simulatorId = String(route.paramMap.get('id'));

  return tradingSimulatorApiService.getTradingSimulatorById(simulatorId).pipe(
    map((simulator) => {
      // check if simulator exists
      if (!simulator) {
        dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
        router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
        return false;
      }

      // check if not in draft state
      if (simulator.state === 'draft') {
        dialogServiceUtil.showNotificationBar('Trading simulator is in draft state', 'error');
        router.navigate([ROUTES_MAIN.TRADING_SIMULATOR]);
        return false;
      }

      return true;
    }),
  );
};
