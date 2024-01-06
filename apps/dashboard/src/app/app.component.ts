import { Component, inject } from '@angular/core';
import { Functions, connectFunctionsEmulator } from '@angular/fire/functions';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  imports: [RouterModule, MatDatepickerModule, MatNativeDateModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: `
      :host {
        display: block;
      }
    `,
})
export class AppComponent {
  private functions = inject(Functions);

  constructor() {
    if (!environment.production) {
      connectFunctionsEmulator(this.functions, '127.0.0.1', 5001);
    }
  }
}
