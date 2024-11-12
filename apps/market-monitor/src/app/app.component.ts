import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  template: `
    <main class="min-h-screen">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent {}
