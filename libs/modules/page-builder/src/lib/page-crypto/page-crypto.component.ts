import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-crypto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-crypto.component.html',
  styleUrls: ['./page-crypto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCryptoComponent {}
