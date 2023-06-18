import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-currency',
  templateUrl: './progress-currency.component.html',
  styleUrls: ['./progress-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class ProgressCurrencyComponent implements OnInit {
  @Input({ required: true }) min!: number;
  @Input({ required: true }) max!: number;
  @Input({ required: true }) value?: number | null;

  constructor() {}

  ngOnInit(): void {}
}
