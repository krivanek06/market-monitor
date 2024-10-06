import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule, MatProgressSpinnerModule, NgClass],
  selector: 'app-root',
  template: `
    <main class="min-h-screen min-w-full">
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
