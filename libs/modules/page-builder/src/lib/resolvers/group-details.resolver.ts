import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { GroupDetails } from '@market-monitor/api-types';
import { GroupFacadeService } from '@market-monitor/modules/group/data-access';
import { LoaderMainService } from '@market-monitor/shared/utils-client';
import { catchError, map, of, tap } from 'rxjs';

/**
 * checks if group id is valid and loads group details or redirects to home
 *
 * @param route
 * @param state
 * @returns
 */
export const groupDetailsResolver: ResolveFn<GroupDetails | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const groupId = route.params['id'];

  const router = inject(Router);
  const groupFacadeService = inject(GroupFacadeService);
  const loaderMainService = inject(LoaderMainService);

  if (!groupId) {
    router.navigate(['/']);
    return of(null);
  }

  // load multiple data at once
  return groupFacadeService.getGroupDetailsById(groupId).pipe(
    // return only details, everything else is cached
    map((groupDetails) => {
      if (!groupDetails) {
        router.navigate(['/']);
        return null;
      }

      console.log('GROUP loaded', groupDetails);

      return groupDetails;
    }),
    tap(() => loaderMainService.setLoading(false)),
    catchError((err) => {
      loaderMainService.setLoading(false);
      // dialogServiceUtil.showNotificationBar(`An error happened getting data for symbol: ${symbol}`, 'error');
      router.navigate(['/']);
      return of(null);
    }),
  );
};
