import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AppComponent {}
