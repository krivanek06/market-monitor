import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-groups-base',
  standalone: true,
  imports: [CommonModule],
  template: `<p>page-groups-base works!</p>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageGroupsBaseComponent {
  groupApiService = inject(GroupApiService);

  groupDetails$ = inject(ActivatedRoute).params.pipe(
    map((d) => d['id']),
    switchMap((id) => this.groupApiService.getGroupDetailsById(id)),
  );
  groupDetailsSignal = toSignal(this.groupDetails$);
}
