import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthenticationAccountService } from '@market-monitor/modules/authentication/data-access';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [''],
})
export class AppComponent {
  loadingAuthenticationSignal = toSignal(this.authenticationAccountService.getLoadingAuthentication());
  constructor(private authenticationAccountService: AuthenticationAccountService) {}
  title = 'market-monitor-dashboard';
}
