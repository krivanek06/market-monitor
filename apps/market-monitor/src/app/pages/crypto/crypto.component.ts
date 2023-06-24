import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-crypto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crypto.component.html',
  styleUrls: ['./crypto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CryptoComponent {}
