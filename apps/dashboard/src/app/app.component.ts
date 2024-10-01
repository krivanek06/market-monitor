import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent {}
