import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { GroupApiService } from '@market-monitor/api-client';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-details.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsComponent {
  groupApiService = inject(GroupApiService);
  groupDetailsSignal = toSignal(
    inject(ActivatedRoute).params.pipe(
      map((d) => d['id']),
      switchMap((id) => this.groupApiService.getGroupDetailsById(id)),
    ),
  );

  constructor() {
    console.log('GroupDetailsComponent');
  }
}
