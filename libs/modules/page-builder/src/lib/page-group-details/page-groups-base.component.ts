import { computed, effect, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GroupApiService } from '@mm/api-client';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { filterNil } from 'ngxtension/filter-nil';
import { injectParams } from 'ngxtension/inject-params';
import { EMPTY, catchError, switchMap } from 'rxjs';
/**
 * Helper class for all page group details components
 */
export abstract class PageGroupsBaseComponent {
  protected groupApiService = inject(GroupApiService);
  protected dialog = inject(MatDialog);
  protected router = inject(Router);
  protected dialogServiceUtil = inject(DialogServiceUtil);

  private groupIdParam = injectParams('id');

  groupDetailsSignal = toSignal(
    toObservable(this.groupIdParam).pipe(
      filterNil(),
      switchMap((id) =>
        this.groupApiService.getGroupDetailsById(id).pipe(
          catchError(() => {
            this.dialogServiceUtil.showNotificationBar('Group not found', 'error');
            this.router.navigateByUrl(ROUTES_MAIN.NOT_FOUND);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  getGroupHoldingsSignalNormal = toSignal(
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

  getGroupHoldingsSignal = computed(() => this.getGroupHoldingsSignalNormal() ?? []);

  constructor() {
    effect(() => {
      console.log('[Groups]: groupIdParam', this.groupIdParam());
    });
    effect(() => {
      console.log('[Groups]: groupDetailsSignal', this.groupDetailsSignal());
    });
  }
}
