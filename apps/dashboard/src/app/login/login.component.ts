import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLoginComponent } from '@market-monitor/modules/page-builder';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, PageLoginComponent],
  template: `<app-page-login></app-page-login>`,
  styles: `
      :host {
        display: block;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  constructor() {}
}
