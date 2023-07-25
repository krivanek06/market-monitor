import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES_PUBLIC_ROUTES } from '../../routes.model';

@Component({
  selector: 'app-public-routes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-routes.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRoutesComponent {
  ROUTES_PUBLIC_ROUTES = ROUTES_PUBLIC_ROUTES;
}
