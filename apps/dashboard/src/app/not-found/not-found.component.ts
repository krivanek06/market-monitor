import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule, MatIconModule],
  template: `
    <section>
      <div class="flex flex-col items-center mt-[250px] 2xl:mt-[400px] gap-4">
        <div class="text-4xl font-bold text-center text-wt-primary">404</div>
        <div class="text-xl font-bold text-center text-wt-primary">Page Not Found</div>
        <div class="text-lg text-center">The page you are looking for doesn't exist or an other error occurred.</div>
        <div class="text-lg text-center text-wt-primary">
          <button mat-flat-button type="button" color="primary" class="h-11">
            <mat-icon>arrow_back</mat-icon>
            <a routerLink="/">Go to Home</a>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
