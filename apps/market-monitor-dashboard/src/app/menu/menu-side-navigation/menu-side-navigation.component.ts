import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { sideNavigation } from './menu-routing.model';

@Component({
  selector: 'app-menu-side-navigation',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './menu-side-navigation.component.html',
  styles: [
    `
      :host {
        @apply block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSideNavigationComponent implements OnInit {
  private route = inject(Router);

  sideNavigation = sideNavigation;
  selectedNavigationPath = '';

  ngOnInit(): void {
    this.selectedNavigationPath = this.route.url.split('/')[1]; // ['', 'dashboard']

    console.log(this.route.url);
  }

  onNavigationClick(path: string) {
    console.log('path', path);
    this.selectedNavigationPath = path;
  }
}
