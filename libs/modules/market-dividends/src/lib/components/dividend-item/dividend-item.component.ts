import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { StockDividend } from '@market-monitor/api-types';
import { DefaultImgDirective } from '@market-monitor/shared-directives';
import { AssetUrlPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-dividend-item',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, AssetUrlPipe, MatButtonModule],
  templateUrl: './dividend-item.component.html',
  styleUrls: ['./dividend-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividendItemComponent {
  @Input({ required: true }) stockDividend!: StockDividend;
  @Input() showBorder = false;
}
