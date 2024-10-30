import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { filterNil } from 'ngxtension/filter-nil';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [MatSlideToggleModule, MatIconModule, ReactiveFormsModule],
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
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly document = inject(DOCUMENT);
  private readonly DARK_THEME = 'dark-theme';

  readonly sliderControl = new FormControl<boolean>(false);

  constructor() {
    const val = !!this.authenticationUserStoreService.state.getUserDataNormal()?.settings?.isDarkMode;
    this.sliderControl.patchValue(val, { emitEvent: false });

    this.sliderControl.valueChanges.pipe(filterNil(), takeUntilDestroyed()).subscribe((val) => {
      if (val) {
        this.document.body.classList.add(this.DARK_THEME);
      } else {
        this.document.body.classList.remove(this.DARK_THEME);
      }

      // save user settings
      this.authenticationUserStoreService.updateUserSettings({
        isDarkMode: val,
      });
    });
  }
}
