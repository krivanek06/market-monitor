import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthenticationFormComponent } from '@market-monitor/modules/authentication/features';
import { DialogServiceModule } from '@market-monitor/shared/features/dialog-manager';

@Component({
  selector: 'app-page-login',
  standalone: true,
  imports: [CommonModule, AuthenticationFormComponent, DialogServiceModule],
  templateUrl: './page-login.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoginComponent {}
