import { Component } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatDatepickerModule, MatNativeDateModule],
  template: `<router-outlet></router-outlet> `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent {}
