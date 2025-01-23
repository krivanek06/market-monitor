import { computed, effect, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GroupApiService } from '@mm/api-client';
import { PortfolioStateHoldings } from '@mm/api-types';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { filterNil } from 'ngxtension/filter-nil';
import { injectParams } from 'ngxtension/inject-params';
import { EMPTY, catchError, switchMap } from 'rxjs';

/**
 * Helper class for all page group details components
 */
export abstract class PageGroupsBaseComponent {
  protected readonly groupApiService = inject(GroupApiService);
  protected readonly dialog = inject(MatDialog);
  protected readonly router = inject(Router);
  protected readonly dialogServiceUtil = inject(DialogServiceUtil);

  private readonly groupIdParam = injectParams('id');

  readonly groupDetailsSignal = toSignal(
    toObservable(this.groupIdParam).pipe(
      filterNil(),
      switchMap((id) =>
        this.groupApiService.getGroupDetailsById(id).pipe(
          catchError(() => {
            this.dialogServiceUtil.showNotificationBar('Group not found', 'error');
            this.router.navigateByUrl(`${ROUTES_MAIN.APP}/${ROUTES_MAIN.NOT_FOUND}`);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  readonly groupPortfolioStateHolding = computed(() => {
    const groupPortfolioState = this.groupDetailsSignal()?.groupData?.portfolioState;
    const holdings = this.getGroupHoldingsSignalNormal();

    if (!groupPortfolioState || !holdings) {
      return undefined;
    }

    return {
      ...groupPortfolioState,
      holdings: holdings,
    } satisfies PortfolioStateHoldings;
  });

  readonly getGroupHoldingsSignal = computed(() => this.getGroupHoldingsSignalNormal() ?? []);

  private readonly getGroupHoldingsSignalNormal = toSignal(
    toObservable(this.groupIdParam).pipe(
      filterNil(),
      switchMap((id) =>
        this.groupApiService.getGroupHoldingsDataById(id).pipe(
          catchError(() => {
            return [];
          }),
        ),
      ),
    ),
  );

  constructor() {
    effect(() => {
      console.log('[Groups]: groupIdParam', this.groupIdParam());
    });
    effect(() => {
      console.log('[Groups]: groupDetailsSignal', this.groupDetailsSignal());
    });
  }
}
