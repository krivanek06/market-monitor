import { Directive, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { GroupFacadeService } from '@market-monitor/modules/group/data-access';
import { map, switchMap } from 'rxjs';

@Directive()
export class PageGroupsBaseComponent {
  groupApiService = inject(GroupApiService);
  groupFacadeService = inject(GroupFacadeService);
  dialog = inject(MatDialog);

  groupDetails$ = inject(ActivatedRoute).params.pipe(
    map((d) => d['id']),
    switchMap((id) => this.groupFacadeService.getGroupDetailsById(id)),
  );
  groupDetailsSignal = toSignal(this.groupDetails$);
}
