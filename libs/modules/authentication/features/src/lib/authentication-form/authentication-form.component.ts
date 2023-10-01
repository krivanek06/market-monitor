import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import {
  AuthenticationAccountService,
  LoginUserInput,
  RegisterUserInput,
} from '@market-monitor/modules/authentication/data-access';
import { FormLoginComponent, FormRegisterComponent } from '@market-monitor/modules/authentication/ui';
import { DialogServiceModule } from '@market-monitor/shared/utils-client';

@Component({
  selector: 'app-authentication-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormLoginComponent,
    FormRegisterComponent,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    DialogServiceModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './authentication-form.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticationFormComponent {
  loginUserInputControl = new FormControl<LoginUserInput | null>(null);
  registerUserInputControl = new FormControl<RegisterUserInput | null>(null);

  authenticationAccountService = inject(AuthenticationAccountService);

  loadingSignal = signal<boolean>(false);

  onGoogleAuth(): void {
    this.authenticationAccountService.signInGoogle();
  }

  onDemoLogin(): void {
    console.log('todo');
  }
}
