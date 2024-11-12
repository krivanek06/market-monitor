import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [MatButtonModule, RouterModule, MatIconModule],
  template: `
    <section>
      <div class="mt-[250px] flex flex-col items-center gap-4 2xl:mt-[400px]">
        <div class="text-wt-primary text-center text-4xl font-bold">404</div>
        <div class="text-wt-primary text-center text-xl font-bold">Page Not Found</div>
        <div class="text-center text-lg">The page you are looking for doesn't exist or an other error occurred.</div>
        <div class="text-wt-primary text-center text-lg">
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
export class PageNotFoundComponent {}
