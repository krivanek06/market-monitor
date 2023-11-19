import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'market-monitor-group-search-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-search-control.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupSearchControlComponent {}
