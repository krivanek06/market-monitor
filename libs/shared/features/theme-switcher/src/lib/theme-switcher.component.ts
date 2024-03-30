import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center gap-4">
      <mat-icon class="text-wt-gray-medium">light_mode</mat-icon>
      <mat-slide-toggle [formControl]="sliderControl" color="primary" />
      <mat-icon class="text-wt-gray-dark">dark_mode</mat-icon>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    ::ng-deep .mat-mdc-slide-toggle .mdc-switch {
      width: 120px !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  private themeService = inject(ThemeService);

  sliderControl = new FormControl<boolean>(false);

  constructor() {
    this.sliderControl.patchValue(this.themeService.isDarkMode());
  }

  ngOnInit(): void {
    this.sliderControl.valueChanges.subscribe(() => {
      console.log('changing toggle theme');
      this.themeService.toggleTheme();
    });
  }
}
