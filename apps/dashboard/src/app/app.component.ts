import { Component } from '@angular/core';
import { getApp } from '@angular/fire/app';
import { connectFunctionsEmulator, getFunctions } from '@angular/fire/functions';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  imports: [RouterModule, MatDatepickerModule, MatNativeDateModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [''],
})
export class AppComponent {
  private functions = getFunctions(getApp());

  constructor() {
    if (!environment.production) {
      connectFunctionsEmulator(this.functions, '127.0.0.1', 5001);
    }
  }
}
